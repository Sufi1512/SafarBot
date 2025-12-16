"""
Template Loader Utility
Loads and renders HTML email templates with variable substitution
"""

import os
from pathlib import Path
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class TemplateLoader:
    """Utility class for loading and rendering HTML email templates"""
    
    def __init__(self, template_dir: Optional[str] = None):
        """
        Initialize template loader
        
        Args:
            template_dir: Directory containing templates (defaults to server/templates/emails)
        """
        if template_dir is None:
            # Get the server directory (parent of utils)
            current_dir = Path(__file__).parent.parent
            template_dir = current_dir / "templates" / "emails"
        
        self.template_dir = Path(template_dir)
        self._cache = {}
    
    def load_template(self, template_name: str) -> str:
        """
        Load template from file
        
        Args:
            template_name: Name of template file (e.g., 'otp_verification.html')
            
        Returns:
            Template content as string
        """
        # Check cache first
        if template_name in self._cache:
            return self._cache[template_name]
        
        # Load from file
        template_path = self.template_dir / template_name
        
        if not template_path.exists():
            logger.error(f"Template not found: {template_path}")
            raise FileNotFoundError(f"Template not found: {template_name}")
        
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Cache it
            self._cache[template_name] = content
            return content
        
        except Exception as e:
            logger.error(f"Error loading template {template_name}: {str(e)}")
            raise
    
    def render_template(self, template_name: str, **kwargs) -> str:
        """
        Render template with variables
        
        Args:
            template_name: Name of template file
            **kwargs: Variables to substitute in template
            
        Returns:
            Rendered HTML string
        """
        template = self.load_template(template_name)
        
        # Simple variable substitution using {{variable}} syntax
        rendered = template
        
        import re
        
        for key, value in kwargs.items():
            # Replace {{key}} with value (handle both {{key}} and {{ key }})
            # Escape special regex characters in key
            escaped_key = re.escape(key)
            pattern = r'\{\{\s*' + escaped_key + r'\s*\}\}'
            rendered = re.sub(pattern, str(value) if value is not None else '', rendered)
        
        # Handle {{#if variable}} blocks (simple implementation)
        # Process in reverse order to maintain string indices
        if_pattern = r'\{\{#if\s+(\w+)\}\}(.*?)\{\{/if\}\}'
        matches = list(re.finditer(if_pattern, rendered, re.DOTALL))
        
        for match in reversed(matches):
            var_name = match.group(1)
            block_content = match.group(2)
            
            # Check if variable exists and is truthy
            if var_name in kwargs and kwargs[var_name]:
                # Replace entire block with content (keep the content)
                rendered = rendered[:match.start()] + block_content + rendered[match.end():]
            else:
                # Remove entire block (including {{#if}} and {{/if}} tags)
                rendered = rendered[:match.start()] + rendered[match.end():]
        
        return rendered
    
    def clear_cache(self):
        """Clear template cache"""
        self._cache.clear()

# Global template loader instance
template_loader = TemplateLoader()

