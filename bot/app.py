from flask import Flask
import super_roast

app = Flask(__name__)


@app.route('/')
def run_task():

    while True:
        super_roast.roast_users()
        print("Roast Bot Running!")

if __name__ == '__main__':
    app.run(debug=True)
