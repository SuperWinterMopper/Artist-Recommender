import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import random, string

# Hyperparameters and other parameters
questionNum = 50    # number of questions user will get asks, corresponds to the dimension of the vectors we will conduct k-NN on 
demographicsNum = 2 # number of demographics
TopArtistNum = 1000 # the top `TopArtistNum` most popular artists will be observed as possible recommendations
ageWeight = 1
genderWeight = 1
numRetArtists = 10
k = 30

# min and max for age to scale our user's data appropriately
ageMin = 1.0
ageMax = 109.0

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
    TOPQ = pd.read_csv('preprocessing/data_vectors_topQ.csv')
    WHOLE = pd.read_csv('preprocessing/data_vectors_whole.csv')

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
    rec_artists = SUMMED.iloc[demographicsNum + questionNum:].nlargest(numRetArtists).index.tolist()

    ARTISTS = pd.read_csv('preprocessing/all_artists_considered.csv')

    ret = ARTISTS[ARTISTS["artist_name"].isin(rec_artists)]
    return ret

def kNN(user: dict[str, str]) -> dict:
    TOPQ, WHOLE = preprocess_DATA()
    USER = preprocess_USER(user)

    assert(len(USER) == 1)
    assert(len(TOPQ.columns) == questionNum + demographicsNum + 1) # + 1 for user_id
    assert(len(TOPQ.columns) == len(USER.columns))
    assert(TOPQ.columns.tolist() == USER.columns.tolist())
    assert(TOPQ.columns[1] == USER.columns[1] == 'gender')
    assert(TOPQ.columns[2] == USER.columns[2] == 'age')
    assert(WHOLE.columns[0:questionNum + demographicsNum + 1].tolist() == TOPQ.columns.tolist())
    assert(len(TOPQ) == len(WHOLE))

    TOPQ_NO_ID = TOPQ.drop('user_id', axis=1)
    USER_NO_ID = USER.drop('user_id', axis=1)
    WHOLE_NO_ID = WHOLE.drop("user_id", axis=1)

    model = NearestNeighbors(n_neighbors=k, metric='minkowski')
    model.fit(TOPQ_NO_ID)

    distances, indices = model.kneighbors(USER_NO_ID)

    assert(len(distances[0]) == k == len(indices[0]))

    ARTISTS = find_top_artists(distances[0], indices[0], WHOLE_NO_ID)

    return ARTISTS.to_dict()

def test():
    return 658

def dummyUserData():
    values = [0, 0.25, 0.5, 0.75, 1.0]
    user = {
        "user_id": "0000ef373bbn0d89ce796abae961f2705e8c1faf",
        "gender": 'm',
        "age": 25,
        "the beatles": random.choice(values),
        "radiohead": random.choice(values),
        "coldplay": random.choice(values),
        "muse": random.choice(values),
        "metallica": random.choice(values),
        "pink floyd": random.choice(values),
        "linkin park": random.choice(values),
        "in flames": random.choice(values),
        "red hot chili peppers": random.choice(values),
        "nine inch nails": random.choice(values),
        "system of a down": random.choice(values),
        "placebo": random.choice(values),
        "death cab for cutie": random.choice(values),
        "depeche mode": random.choice(values),
        "iron maiden": random.choice(values),
        "nirvana": random.choice(values),
        "the killers": random.choice(values),
        "nightwish": random.choice(values),
        "rammstein": random.choice(values),
        "arctic monkeys": random.choice(values),
        "bob dylan": random.choice(values),
        "led zeppelin": random.choice(values),
        "green day": random.choice(values),
        "the cure": random.choice(values),
        "sigur rós": random.choice(values),
        "blink-182": random.choice(values),
        "queen": random.choice(values),
        "oasis": random.choice(values),
        "u2": random.choice(values),
        "tool": random.choice(values),
        "foo fighters": random.choice(values),
        "fall out boy": random.choice(values),
        "koЯn": random.choice(values),
        "björk": random.choice(values),
        "david bowie": random.choice(values),
        "jack johnson": random.choice(values),
        "britney spears": random.choice(values),
        "elliott smith": random.choice(values),
        "the smashing pumpkins": random.choice(values),
        "rise against": random.choice(values),
        "madonna": random.choice(values),
        "sufjan stevens": random.choice(values),
        "kanye west": random.choice(values),
        "daft punk": random.choice(values),
        "disturbed": random.choice(values),
        "queens of the stone age": random.choice(values),
        "tom waits": random.choice(values),
        "modest mouse": random.choice(values),
        "the rolling stones": random.choice(values),
        "the offspring": random.choice(values),
    }
    return user

def myUserData():
    return {
        "user_id": "0000ef373bbn0d89ce796abae961f2705e8c1faf",
        "gender": 'm',
        "age": 25,
        "the beatles": .5,
        "radiohead": 1.0,
        "coldplay": 0,
        "muse": 1.0,
        "metallica": 1.0,
        "pink floyd": 1.0,
        "linkin park": 0,
        "in flames": 0,
        "red hot chili peppers": .5,
        "nine inch nails": 1,
        "system of a down": 1.0,
        "placebo": 0,
        "death cab for cutie": 0,
        "depeche mode": 0,
        "iron maiden": 1,
        "nirvana": .5,
        "the killers": 0.0,
        "nightwish": 1.0,
        "rammstein": 1,
        "arctic monkeys": .5,
        "bob dylan": 1.0,
        "led zeppelin": 1.0,
        "green day": 0,
        "the cure": 0.0,
        "sigur rós": 1.0,
        "blink-182": 0,
        "queen": 1.0,
        "oasis": .5,
        "u2": .5,
        "tool": 1.0,
        "foo fighters": 0.0,
        "fall out boy": 0.0,
        "koЯn": .5,
        "björk": 1,
        "david bowie": 1.0,
        "jack johnson": .5,
        "britney spears": 0.0,
        "elliott smith": 0.0,
        "the smashing pumpkins": .5,
        "rise against": 0,
        "madonna": 0.0,
        "sufjan stevens": .5,
        "kanye west": 0,
        "daft punk": 1.0,
        "disturbed": 1.0,
        "queens of the stone age": .5,
        "tom waits": 1.0,
        "modest mouse": .0,
        "the rolling stones": 0,
        "the offspring": 0
    }