import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import minmax_scale
import random, string
from google import genai
from google.genai import types
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Hyperparameters and other parameters
questionNum = 20    # number of questions user will get asks, corresponds to the dimension of the vectors we will conduct k-NN on 
demographicsNum = 2 # number of demographics
TopArtistNum = 5000 # the top `TopArtistNum` most popular artists will be observed as possible recommendations
ageWeight = 1
genderWeight = 1
numRetArtists = 15
k = 300

# min and max for age to scale our user's data appropriately
ageMin = 1.0
ageMax = 109.0

# supabase variables
load_dotenv() # load .env into os.
url: str = os.environ.get("SUPABASE_URL") or ""
key: str = os.environ.get("SUPABASE_PUBLISHABLE_KEY") or ""
supabase: Client = create_client(url, key)

def preprocess_USER(user: dict) -> pd.DataFrame:
    USER = pd.DataFrame([user])
    assert(USER['gender'].iloc[0] in ['m', 'f', 'other'])

    USER_age = USER['age']
    USER['age'] = ((USER_age - ageMin) / (ageMax - ageMin))

    USER_gender = USER['gender'].iloc[0].lower()
    USER['gender'] = 0 if USER_gender == 'm' else (1 if USER_gender == 'f' else .5)

    USER['age'] *= ageWeight
    USER['gender'] *= genderWeight
    return USER

def preprocess_DATA() -> tuple[pd.DataFrame, pd.DataFrame]:
    # read in data
    TOPQ = pd.read_csv('public/data_vectors_topQ.csv')
    WHOLE = pd.read_csv('public/data_vectors_whole.csv')

    # scale both USER and TOPQ data's demographic data
    TOPQ['gender'] *= genderWeight
    WHOLE['gender'] *= genderWeight

    TOPQ['age'] *= ageWeight
    WHOLE['age'] *= ageWeight

    return TOPQ, WHOLE

def find_top_artists(distances, indices, WHOLE_NO_ID: pd.DataFrame) -> pd.DataFrame:
    weights = 1 / (distances + 1e-9)   
    weights = weights / weights.sum()  # normalize
    SCALED = WHOLE_NO_ID.iloc[indices].mul(weights, axis=0)

    SUMMED = SCALED.sum(axis=0)
    artist_scores = SUMMED.iloc[demographicsNum + questionNum:]
    top_scores = artist_scores.nlargest(numRetArtists)  # Series indexed by artist_name
    rec_artists = top_scores.index.tolist()

    ARTISTS = pd.read_csv('public/all_artists_considered.csv')

    ARTISTS_indexed = ARTISTS.set_index("artist_name")
    available = [a for a in rec_artists if a in ARTISTS_indexed.index]
    ret = ARTISTS_indexed.loc[available].reset_index()

    ret.insert(0, "placement", range(1, len(ret) + 1))
    ret["match_score"] = top_scores.loc[ret["artist_name"]].values
    ret["match_score"] = minmax_scale(ret["match_score"].astype(float))  
    ret.drop(columns=["artist_id", "plays", "placement"], axis=0, inplace=True)
    return ret

def validateDataFrames(TOPQ: pd.DataFrame, WHOLE: pd.DataFrame, USER: pd.DataFrame):
    tc = TOPQ.columns.tolist()
    uc = USER.columns.tolist()
    for i in range(min(len(tc), len(uc))):
        if tc[i] != uc[i]:
            print(f"==============NOT SAME: {tc[i]}, {uc[i]}==============")

    assert(len(USER) == 1)
    assert(len(TOPQ.columns) == questionNum + demographicsNum + 1) # + 1 for user_id
    assert(len(TOPQ.columns) == len(USER.columns))
    assert(TOPQ.columns.tolist() == USER.columns.tolist())
    assert(TOPQ.columns[1] == USER.columns[1] == 'gender')
    assert(TOPQ.columns[2] == USER.columns[2] == 'age')
    assert(WHOLE.columns[0:questionNum + demographicsNum + 1].tolist() == TOPQ.columns.tolist())
    assert(len(TOPQ) == len(WHOLE))


def kNN(user: dict[str, str]) -> dict:
    TOPQ, WHOLE = preprocess_DATA()
    USER = preprocess_USER(user)

    validateDataFrames(TOPQ, WHOLE, USER)

    TOPQ_NO_ID = TOPQ.drop('user_id', axis=1)
    USER_NO_ID = USER.drop('user_id', axis=1)
    WHOLE_NO_ID = WHOLE.drop("user_id", axis=1)

    model = NearestNeighbors(n_neighbors=k, metric='cosine')

    model.fit(TOPQ_NO_ID)

    distances, indices = model.kneighbors(USER_NO_ID)

    assert(len(distances[0]) == k == len(indices[0]))

    ARTISTS = find_top_artists(distances[0], indices[0], WHOLE_NO_ID)

    return ARTISTS.to_dict()

def test():
    return 658

def myUserData():
    return {
        "user_id": "0000ef373bbn0d89ce796abae961f2705e8c1faf",
        "gender": 'm',
        "age": 25,
        "the beatles": 0.5,
        "radiohead": 1.0,
        "linkin park": 0,
        "coldplay": 0,
        "muse": 1.0,
        "pink floyd": 1.0,
        "metallica": 1.0,
        "nine inch nails": 1,
        "depeche mode": 0,
        "christina aguilera": 0,
        "lil wayne": 0,
        "system of a down": 1.0,
        "red hot chili peppers": 0.5,
        "placebo": 0,
        "in flames": 0,
        "death cab for cutie": 0,
        "rammstein": 1,
        "rise against": 0,
        "bob dylan": 1.0,
        "the killers": 0.0,
        "arctic monkeys": 0.5,
        "afi": 0,
        "nirvana": 0.5,
        "led zeppelin": 1.0,
        "koЯn": 0.5,
        "garbage": 0,
        "iron maiden": 1,
        "green day": 0,
        "nightwish": 1.0,
        "the cure": 0.0,
        "kanye west": 0,
        "the smashing pumpkins": 0.5,
        "david bowie": 1.0,
        "ac/dc": 0,
        "queen": 1.0,
        "björk": 1,
        "daft punk": 1.0,
        "jack johnson": 0.5,
        "sigur rós": 1.0,
        "tom waits": 1.0,
        "u2": 0.5,
        "tool": 1.0,
        "böhse onkelz": 0,
        "britney spears": 0.0,
        "elliott smith": 0.0,
        "madonna": 0.0,
        "the prodigy": 0,
        "oasis": 0.5,
        "queens of the stone age": 0.5,
        "boards of canada": 1.0
    }

def promptGemini(prompt: str):
    client = genai.Client()


    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=prompt,
        # config=types.GenerateContentConfig(
        #     thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        # ),
    )
    return response.text

def postUserData(user: dict):
    # response = supabase.table('user_data').insert()
    return {}

def getUserData(id: str):
    response = supabase.table('user_data').select('*').eq("id", id).execute()

    return response.data