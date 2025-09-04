from flask import Flask, jsonify, request
from .modules import test, dummyUserData, myUserData, kNN

app = Flask(__name__)

@app.route('/flask/incomes')
def get_incomes():
    num = test()
    incomes = [
        { 'description': 'salary', 'amount': num }
    ]

    userData = myUserData()
    recs = kNN(userData)
    print("=========================================================================")    
    print("Recommendation artists:")
    print(recs)

    print("CALLED API")
    return jsonify(incomes)

@app.route('/flask/ratings', methods=['POST'])
def processRatings():
    """
    Recieves arbitrary number of ratings in json format 
    {
        'artist': string, 
        'rating': number,
    }
    and applies processes them. 
    """
    userResponses = request.get_json()
    print("Recieved json: ", userResponses)
    return jsonify(kNN(userResponses))

@app.route('/flask/stats')
def getStats():
    """
    Returns arbitrarily large number of artist recs and arbitrary number of other stats based on user's ratings provided in '/flask/ratings'. \n
    Return json format is 
    {
        'status': string
        'artists': 
            {
                'name': string, 
                'match percentage': number, 
                'features': 
                    {
                        'feature name 1': number,
                        'feature name 2': number,
                    }        
            }
    } 
    """
    return jsonify({'status': 'success'})

@app.route('/flask/gemeni')
def getGemeniImpression():
    """
    Returns a resopnse of Google Gemeni to the user's tastes. Returns json of the format:
    { 
        'status': string,
        output: string,
    }
    """
    tempReturn = {
        'status': 'success',
        'output': 'Wow you have such great taste :D',
    }
    return jsonify(tempReturn)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)