from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from modules import test, kNN, promptGemini, postUserData, getUserData
import logging, sys

app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
app.logger.setLevel(logging.INFO)


CORS(app=app, origins=["https://artist-recommender-fqgq.vercel.app"])

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
    if not response:
        return jsonify({"error": "Failed to post user data"}), 500
    if not isinstance(response, list):
        return jsonify({"error": "Response is not a list"}), 500
    response = response[0]
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
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)

@app.get("/healthz")
def healthz():
    return "ok", 200