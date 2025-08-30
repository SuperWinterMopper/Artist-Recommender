from flask import Flask, jsonify, request
from artist_dataset import statData 

app = Flask(__name__)

@app.route('/flask/incomes')
def get_incomes():
    incomes = [
        { 'description': 'salary', 'amount': 2000 }
    ]
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
    print("Recieved json: ", request.get_json())
    return jsonify({'status': 'success'})

@app.router('/flask/stats')
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
    return jsonify(statData)

@app.router('/flask/gemeni')
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