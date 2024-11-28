from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for all origins (for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DynamoDB setup
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
movies_table = dynamodb.Table('Movies')

class Movie(BaseModel):
    movieId: str
    imageLink: str
    title: str
    rating: float
    review: str  

def convert_data_to_dynamodb_format(data: Any) -> Any:
    """Recursively converts all floats to Decimals and handles lists/dictionaries."""
    if isinstance(data, float):
        return Decimal(str(data))
    elif isinstance(data, dict):
        return {k: convert_data_to_dynamodb_format(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_data_to_dynamodb_format(item) for item in data]
    return data

@app.post("/movie")
def add_movie(movie: Movie):
    movie_data = movie.dict()
    print("Movie data being inserted:", movie_data)  # Debug log
    movie_data = convert_data_to_dynamodb_format(movie_data)
    movies_table.put_item(Item=movie_data)
    return {"message": "Movie added successfully!"}


@app.get("/movies", response_model=List[Movie])
async def get_movies():
    try:
        response = movies_table.scan()
        movies = response.get('Items', [])
        movies.sort(key=lambda x: x['rating'], reverse=True)
        return movies
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Error fetching movies.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5555)
