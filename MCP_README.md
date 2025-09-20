# SafarBot MCP Server

A Model Context Protocol (MCP) server that provides itinerary generation capabilities for SafarBot through a standardized interface.

## 🚀 Features

The MCP server exposes the following tools:

### 1. **generate_itinerary**
Generate complete travel itineraries with places, activities, and recommendations.

**Parameters:**
- `destination` (required): Travel destination
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `travelers` (optional): Number of travelers (default: 1)
- `budget` (optional): Budget in USD
- `interests` (optional): List of interests (e.g., ['culture', 'food', 'adventure'])
- `accommodation_type` (optional): Type of accommodation (budget, mid-range, luxury)

### 2. **get_place_details**
Get detailed information about a specific place.

**Parameters:**
- `place_name` (required): Name of the place
- `location` (optional): Location context

### 3. **get_weather_forecast**
Get weather forecast for a destination.

**Parameters:**
- `destination` (required): Destination
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

### 4. **search_places**
Search for places of interest in a destination.

**Parameters:**
- `query` (required): Search query
- `location` (required): Location to search in
- `place_type` (optional): Type of place

### 5. **get_travel_recommendations**
Get personalized travel recommendations.

**Parameters:**
- `destination` (required): Travel destination
- `interests` (optional): List of interests
- `budget_range` (optional): Budget range
- `duration_days` (optional): Number of days

## 📦 Installation

1. **Install MCP dependencies:**
   ```bash
   pip install -r requirements-mcp.txt
   ```

2. **Set up environment variables:**
   ```bash
   export GOOGLE_API_KEY="your_google_api_key"
   export SERP_API_KEY="your_serp_api_key"
   export OPEN_WEATHER_API_KEY="your_openweather_api_key"
   export BREVO_API_KEY="your_brevo_api_key"
   export MONGODB_URL="your_mongodb_url"
   export LANGSMITH_API_KEY="your_langsmith_api_key"
   ```

## 🚀 Usage

### Running the MCP Server

```bash
python mcp_server.py
```

### Using with MCP Clients

The server can be integrated with any MCP-compatible client. Here's an example configuration:

```json
{
  "mcpServers": {
    "safarbot-itinerary": {
      "command": "python",
      "args": ["mcp_server.py"],
      "env": {
        "GOOGLE_API_KEY": "${GOOGLE_API_KEY}",
        "SERP_API_KEY": "${SERP_API_KEY}",
        "OPEN_WEATHER_API_KEY": "${OPEN_WEATHER_API_KEY}",
        "BREVO_API_KEY": "${BREVO_API_KEY}",
        "MONGODB_URL": "${MONGODB_URL}",
        "LANGSMITH_API_KEY": "${LANGSMITH_API_KEY}"
      }
    }
  }
}
```

### Testing the Server

Run the test client to verify functionality:

```bash
python mcp_client_test.py
```

## 🔧 Integration Examples

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "safarbot-itinerary": {
      "command": "python",
      "args": ["/path/to/safarbot/mcp_server.py"],
      "env": {
        "GOOGLE_API_KEY": "your_key_here"
      }
    }
  }
}
```

### With Other AI Tools

The MCP server can be integrated with any tool that supports the Model Context Protocol, including:
- Claude Desktop
- Cline (VS Code extension)
- Custom AI applications
- Other MCP-compatible tools

## 🛠️ Development

### Adding New Tools

To add new tools to the MCP server:

1. Add the tool definition in `_register_tools()`
2. Implement the handler method
3. Add the tool call in `handle_call_tool()`

### Error Handling

The server includes comprehensive error handling and logging. Check the logs for debugging information.

## 📋 Requirements

- Python 3.8+
- FastAPI
- MCP library
- Your existing SafarBot services

## 🔒 Security

The MCP server inherits all security features from your SafarBot application:
- Input validation
- Rate limiting
- Authentication (if needed)
- Error handling

## 📞 Support

For issues or questions about the MCP server, refer to the main SafarBot documentation or create an issue in the repository.

## 🎯 Benefits

- **Standardized Interface**: Use your itinerary generation with any MCP-compatible tool
- **Modular Design**: Easy to extend with new capabilities
- **AI Integration**: Works seamlessly with Claude, Cline, and other AI tools
- **Reusable**: Share your itinerary generation capabilities across different applications
