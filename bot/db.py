import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("./firebase.json")
firebase_admin.initialize_app(cred, {
  'databaseURL': 'https://reclaim-b8378-default-rtdb.firebaseio.com/'
})

def write_roast_data(roast_id, roaster, roastee, flowrate):
  ref = db.reference(f'roasts/{roast_id}')
  ref.set({
    'roaster': roaster,
    'roastee': roastee,
    'flowrate': flowrate
  })

def read_roast_data(roast_id):
  try:
    ref = db.reference(f'roasts/{roast_id}')
    snapshot = ref.get()
    if snapshot:
      return snapshot
    else:
      print("No data available")
      return None
  except Exception as e:
    print(e)
    return None

