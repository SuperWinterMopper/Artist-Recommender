from flask import Flask, jsonify, request
from .modules import test, kNN, promptGemini, postUserData, getUserData

app = Flask(__name__)

@app.route('/flask/ratings', methods=['POST'])
def processRatings():
    userResponses = request.get_json()
    # print("Recieved json: ", userResponses)
    return jsonify(kNN(userResponses))

@app.route('/flask/gemini', methods=['POST'])
def getGeminiImpression():
    prompt = request.get_json()['prompt']
    print("Recieved json for gemini: ", prompt)
    output = promptGemini(prompt)
    print("Recieved gemini output: ", output)
    return jsonify(output)

@app.route('/flask/postUser', methods=['POST'])
def postUser():
    user = request.get_json()
    print("postUser called with user: ", user)
    response = postUserData(user)
    return jsonify(response)

@app.route('/flask/getUser')
def getUser():
    print("getUser called!!")
    userId = request.args.get('id')
    if not userId:
        return jsonify({'error': 'id not supplied'}), 400
    row = getUserData(userId)
    if not row:
        return jsonify({"error": "id does not exist in database"}), 404
    if not isinstance(row, list):
        return jsonify({"error": "row is not a list"}), 500
    row = row[0]
    return jsonify(row)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)