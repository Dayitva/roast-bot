from flask import Flask
import super_roast

app = Flask(__name__)

# add firebase integration - pull current flow rate
# make call to contract to check flow rate to see if its changed 
# if the flow rate has changed, start roasting a new user 
# append frame to each cast


@app.route('/')
def run_task():

    while True:
        super_roast.roast_users()
        print("Roast Bot Running!")

if __name__ == '__main__':
    app.run(debug=True)
