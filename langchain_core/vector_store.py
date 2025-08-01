import os
import json
from typing import List, Dict, Any, Optional
import logging
import chromadb
from chromadb.config import Settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.client = self._initialize_chroma()
        self.embeddings = self._initialize_embeddings()
        self.collection = self._get_or_create_collection()
        
    def _initialize_chroma(self) -> chromadb.Client:
        """Initialize ChromaDB client"""
        try:
            persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
            os.makedirs(persist_directory, exist_ok=True)
            
            return chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(
                    anonymized_telemetry=False
                )
            )
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {str(e)}")
            raise
    
    def _initialize_embeddings(self) -> GoogleGenerativeAIEmbeddings:
        """Initialize Google Generative AI embeddings"""
        try:
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY environment variable is required")
            
            return GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=api_key
            )
        except Exception as e:
            logger.error(f"Error initializing embeddings: {str(e)}")
            raise
    
    def _get_or_create_collection(self) -> chromadb.Collection:
        """Get or create the travel information collection"""
        try:
            collection_name = "travel_information"
            
            # Try to get existing collection
            try:
                collection = self.client.get_collection(collection_name)
                logger.info(f"Using existing collection: {collection_name}")
            except:
                # Create new collection if it doesn't exist
                collection = self.client.create_collection(
                    name=collection_name,
                    metadata={"description": "Travel information and recommendations"}
                )
                logger.info(f"Created new collection: {collection_name}")
                
                # Initialize with sample data
                await self._initialize_sample_data(collection)
            
            return collection
            
        except Exception as e:
            logger.error(f"Error getting/creating collection: {str(e)}")
            raise
    
    async def _initialize_sample_data(self, collection: chromadb.Collection):
        """Initialize collection with sample travel data"""
        try:
            sample_data = [
                {
                    "id": "paris_attractions",
                    "text": "Paris is famous for the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Champs-Élysées. Best time to visit is spring (April-June) or fall (September-October).",
                    "metadata": {
                        "destination": "Paris",
                        "category": "attractions",
                        "interests": ["culture", "history", "art"]
                    }
                },
                {
                    "id": "tokyo_food",
                    "text": "Tokyo offers amazing sushi at Tsukiji Market, ramen in Shibuya, and traditional kaiseki dining. Must-try foods include sushi, ramen, tempura, and wagyu beef.",
                    "metadata": {
                        "destination": "Tokyo",
                        "category": "food",
                        "interests": ["food", "culture", "local"]
                    }
                },
                {
                    "id": "london_history",
                    "text": "London's historical sites include Tower of London, Buckingham Palace, Westminster Abbey, and Big Ben. The city has rich history dating back to Roman times.",
                    "metadata": {
                        "destination": "London",
                        "category": "history",
                        "interests": ["history", "culture", "architecture"]
                    }
                }
            ]
            
            # Add documents to collection
            for item in sample_data:
                embedding = await self.embeddings.aembed_query(item["text"])
                collection.add(
                    embeddings=[embedding],
                    documents=[item["text"]],
                    metadatas=[item["metadata"]],
                    ids=[item["id"]]
                )
            
            logger.info("Initialized collection with sample data")
            
        except Exception as e:
            logger.error(f"Error initializing sample data: {str(e)}")
    
    async def search(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for relevant travel information"""
        try:
            # Generate embedding for query
            query_embedding = await self.embeddings.aembed_query(query)
            
            # Prepare where clause for filtering
            where_clause = {}
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        where_clause[key] = {"$in": value}
                    else:
                        where_clause[key] = value
            
            # Search collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_clause if where_clause else None
            )
            
            # Format results
            formatted_results = []
            if results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "text": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else 0
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching vector store: {str(e)}")
            return []
    
    async def add_document(
        self,
        text: str,
        metadata: Dict[str, Any],
        doc_id: Optional[str] = None
    ) -> bool:
        """Add a new document to the vector store"""
        try:
            if not doc_id:
                doc_id = f"doc_{len(self.collection.get()['ids'])}"
            
            # Generate embedding
            embedding = await self.embeddings.aembed_query(text)
            
            # Add to collection
            self.collection.add(
                embeddings=[embedding],
                documents=[text],
                metadatas=[metadata],
                ids=[doc_id]
            )
            
            logger.info(f"Added document with ID: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            return False
    
    async def add_travel_data(self, destination: str, data: Dict[str, Any]):
        """Add travel data for a specific destination"""
        try:
            categories = ["attractions", "food", "accommodation", "transport", "culture"]
            
            for category in categories:
                if category in data:
                    text = data[category]
                    metadata = {
                        "destination": destination,
                        "category": category,
                        "interests": data.get("interests", [])
                    }
                    
                    doc_id = f"{destination}_{category}"
                    await self.add_document(text, metadata, doc_id)
            
            logger.info(f"Added travel data for {destination}")
            
        except Exception as e:
            logger.error(f"Error adding travel data: {str(e)}")
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection"""
        try:
            collection_data = self.collection.get()
            return {
                "total_documents": len(collection_data['ids']),
                "destinations": list(set([meta.get('destination', '') for meta in collection_data['metadatas'] if meta])),
                "categories": list(set([meta.get('category', '') for meta in collection_data['metadatas'] if meta]))
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            return {} 