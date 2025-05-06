
from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from enum import Enum
from datetime import datetime, timedelta
import io, csv


class status(Enum):
  active = "active"
  inactive = "inactive"
  dormant = "dormant"

class trans_type(Enum):
  credit = "credit"
  debit = "debit"

app = Flask(__name__)

CORS(app, supports_credentials=True, origins="*")
app.config['SQLALCHEMY_DATABASE_URI'] = "url in private repo"
app.config['JWT_SECRET_KEY'] = 'super-secret-jwt-key'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)



class UserAccount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(),nullable=False)
    email = db.Column(db.String(),nullable=False)
    password = db.Column(db.String(),nullable=False)
    phno = db.Column(db.Integer,nullable=False)
    balance = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.Enum(status),nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_account.id'))
    user = db.relationship('UserAccount', backref=db.backref('transactions', lazy=True))
    trans_type = db.Column(db.Enum(trans_type),nullable=False)
    amount = db.Column(db.Integer,nullable=False)
    timestamp = db.Column(db.DateTime,nullable=False)
    description = db.Column(db.Text)

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_account.id'))
    user = db.relationship('UserAccount', backref=db.backref('audit_logs', lazy=True))
    action = db.Column(db.String(),nullable=False)
    timestamp = db.Column(db.DateTime,nullable=False)
    description = db.Column(db.Text)

class Autehntication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_account.id'))
    user = db.relationship('UserAccount', backref=db.backref('authentication', lazy=True))
    login = db.Column(db.DateTime,nullable=False)
    logout = db.Column(db.DateTime)
    device = db.Column(db.Text)
    description = db.Column(db.Text)

class internalLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    types = db.Column(db.String(),nullable=False)
    timestamp = db.Column(db.DateTime,nullable=False)
    description = db.Column(db.Text)
    resolved = db.Column(db.Boolean)



@app.route('/')
def index():
    return "duck off"

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = UserAccount(name=data['name'], email=data['email'], balance = 0,password=hashed_pw, phno=data['phno'], status=status.active)
    db.session.add(user)
    db.session.commit()
    return jsonify(msg="User registered"), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = UserAccount.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = create_access_token(identity=user.id, expires_delta=timedelta(hours=2))
        return jsonify(access_token=token), 200
    return jsonify(msg="Bad credentials"), 401


@app.route('/account', methods=['GET'])
@jwt_required()
def get_account():
    uid = get_jwt_identity()
    user = UserAccount.query.get(uid)
    return jsonify(name=user.name, email=user.email, phno=user.phno, balance=user.balance)


@app.route('/account', methods=['PUT'])
@jwt_required()
def update_account():
    uid = get_jwt_identity()
    data = request.json
    user = UserAccount.query.get(uid)
    user.name = data.get('name', user.name)
    user.phno = data.get('phno', user.phno)
    db.session.commit()
    return jsonify(msg="Account updated")


@app.route('/transfer', methods=['POST'])
@jwt_required()
def transfer():
    uid = get_jwt_identity()
    data = request.json
    sender = UserAccount.query.get(uid)
    recipient = UserAccount.query.filter_by(email=data['to_email']).first()
    amount = int(data['amount'])
    if not recipient or sender.balance < amount:
        return jsonify(msg="Invalid transfer"), 400
    sender.balance -= amount
    recipient.balance += amount
    db.session.add_all([
        Transactions(user_id=sender.id, trans_type=trans_type.debit, amount=amount, timestamp=datetime.utcnow(), description=f"Transfer to {recipient.email}"),
        Transactions(user_id=recipient.id, trans_type=trans_type.credit, amount=amount, timestamp=datetime.utcnow(), description=f"Received from {sender.email}")
    ])
    db.session.commit()
    return jsonify(msg="Transfer successful")


@app.route('/transactions/history', methods=['GET'])
@jwt_required()
def history():
    uid = get_jwt_identity()
    txns = Transactions.query.filter_by(user_id=uid).order_by(Transactions.timestamp.desc()).all()
    result = [dict(type=t.trans_type.value, amount=t.amount, time=t.timestamp.isoformat(), desc=t.description) for t in txns]
    return jsonify(result)


@app.route('/transactions/download', methods=['GET'])
@jwt_required()
def download():
    uid = get_jwt_identity()
    txns = Transactions.query.filter_by(user_id=uid).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Type", "Amount", "Time", "Description"])
    for t in txns:
        writer.writerow([t.trans_type.value, t.amount, t.timestamp, t.description])
    output.seek(0)
    return send_file(io.BytesIO(output.read().encode()), mimetype='text/csv', download_name='statement.csv', as_attachment=True)

@app.route('/recover', methods=['POST'])
def recover():
    email = request.json['email']
    user = UserAccount.query.filter_by(email=email).first()
    if not user:
        return jsonify(msg="Email not found"), 404
    token = create_access_token(identity=user.id, expires_delta=timedelta(minutes=10))
    return jsonify(reset_token=token)


@app.route('/reset-password', methods=['POST'])
@jwt_required()
def reset():
    uid = get_jwt_identity()
    new_password = request.json['new_password']
    user = UserAccount.query.get(uid)
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify(msg="Password reset successful")


@app.route('/admin/accounts', methods=['GET'])
@jwt_required()
def admin_accounts():
    uid = get_jwt_identity()
    user = UserAccount.query.get(uid)
    if user.name != 'Admin':
        return jsonify(msg="Unauthorized"), 403
    accounts = UserAccount.query.all()
    result = [dict(id=u.id, name=u.name, email=u.email, balance=u.balance, status=u.status.value) for u in accounts]
    return jsonify(result)


@app.route('/admin/add-funds', methods=['POST'])
@jwt_required()
def admin_add_funds():
    uid = get_jwt_identity()
    admin_user = UserAccount.query.get(uid)

   
    if not admin_user or admin_user.name != 'Admin':
        return jsonify(msg="Unauthorized"), 403

    data = request.json
    email = data.get('email')
    amount = data.get('amount')

    if not email or not amount:
        return jsonify(msg="Missing email or amount"), 400

    user = UserAccount.query.filter_by(email=email).first()
    if not user:
        return jsonify(msg="User not found"), 404

    try:
        amount = int(amount)
        if amount <= 0:
            return jsonify(msg="Amount must be positive"), 400
    except ValueError:
        return jsonify(msg="Invalid amount"), 400

    
    user.balance += amount

    txn = Transactions(
        user_id=user.id,
        trans_type=trans_type.credit,
        amount=amount,
        timestamp=datetime.utcnow(),
        description=f"Admin added funds"
    )
    db.session.add(txn)
    db.session.commit()

    return jsonify(msg=f"Added ₹{amount} to {user.email}'s account."), 200


def create_db_and_admin():
    with app.app_context():
        db.create_all()

        
        existing_admin = UserAccount.query.filter_by(email="admin@example.com").first()
        if not existing_admin:
            print("Creating admin user...")
            hashed_pw = bcrypt.generate_password_hash("admin123").decode('utf-8')
            admin = UserAccount(
                name="Admin",
                email="admin@example.com",
                password=hashed_pw,
                phno=9999999999,
                status=status.active,
                created_at=datetime.utcnow(),
                balance=0  
            )
            db.session.add(admin)
            try:
                db.session.commit()
                print("Admin user created successfully.")
            except IntegrityError:
                db.session.rollback()
                print("Admin creation failed due to DB error.")
        else:
            print("Admin user already exists.")


create_db_and_admin()

if __name__ == "__main__":
   
    app.run(host="0.0.0.0", port=5000)