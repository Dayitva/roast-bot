from flask import Flask
import agent 
import time

app = Flask(__name__)

@app.route('/')
def run_task():

    while True:


        print("Roast Bot Running!")
        # agent.roast_user('femi-adebimpe')


        # add logic to check the frame 


        time.sleep(2)

if __name__ == '__main__':
    app.run(debug=True)
