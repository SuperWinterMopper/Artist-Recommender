from flask import Flask, jsonify, request

app = Flask(__name__)

incomes = [
    { 'description': 'salary', 'amount': 5000 }
]

@app.route('/api/incomes')
def get_incomes():
    print("CALLED API")
    return jsonify(incomes)

@app.route('/api/incomes', methods=['POST'])
def add_income():
    incomes.append(request.get_json())
    return '', 204

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)