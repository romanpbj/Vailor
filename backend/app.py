from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from dotenv import load_dotenv
import os
import boto3
import uuid
import traceback
import json
from sqlalchemy import or_, and_
from flask_jwt_extended import JWTManager, create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from PIL import Image as PilImage
import io
import requests
import shippo






load_dotenv()
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")
jwt = JWTManager(app)

ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")
SHIPPO_API_TOKEN = os.getenv("SHIPPO_KEY")
SHIPPO_API_URL = "https://api.goshippo.com/shipments/"

sdk_config = {"api_key": os.getenv("SHIPPO_KEY")}

s3_client = boto3.client(
    "s3",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name=AWS_REGION
)

db = SQLAlchemy(app)

class Listing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(300), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    category_details = db.Column(db.String(50), nullable=False)
    size = db.Column(db.String(20), nullable = False)
    likes = db.Column(db.Integer, default = 0, nullable = True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    length = db.Column(db.String(10), nullable = False)
    width = db.Column(db.String(10), nullable = False)
    height = db.Column(db.String(10), nullable = False)
    weight = db.Column(db.String(10), nullable = False)
    sold = db.Column(db.Boolean, nullable = False, default = False)
    label = db.Column(db.String(500), nullable = True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "price": self.price,
            "description": self.description,
            "category" : self.category,
            "category_details": self.category_details,
            "likes": self.likes,
            "date": self.date.isoformat(),
            "size": self.size,
            "sold": self.sold,
            "label": self.label
        }
    
    def shipping_dict(self):
        return {
            "length": self.length,
            "width": self.width,
            "height": self.height,
            "weight": self.weight,
            "distance_unit": "in",
            "mass_unit": "lb"
        }
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    total_bag_price = db.Column(db.Integer, nullable = True)
    name = db.Column(db.String(80), nullable = True)
    street1 = db.Column(db.String(50), nullable = True)
    street2 = db.Column(db.String(50), nullable = True)
    city = db.Column(db.String(50), nullable = True)
    state = db.Column(db.String(5), nullable = True)
    zip = db.Column(db.String(20), nullable = True)
    country = db.Column(db.String(50), nullable = True)
    phone = db.Column(db.String(30), nullable = True)
    validAddress = db.Column(db.Boolean, default = False)


    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "total_bag_price": self.total_bag_price
        }
    
    def to_address(self):
        return {
            "name": self.name,
            "street1": self.street1,
            "street2": self.street2,
            "city": self.city,
            "state": self.state,
            "zip": self.zip,
            "country": self.country,
            "phone": self.phone,
            "email": self.email,
            "validAddress": self.validAddress
        }

    
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=False)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'listing_id', name='unique_user_listing'),)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "listing_id": self.listing_id
        }
    
class Image(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=True)
    image_url = db.Column(db.String(255), nullable=False)
    profile_image_id = db.Column(db.Integer, nullable = True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "listing_id": self.listing_id,
            "image_url": self.image_url,
            "profile_image_id": self.profile_image_id
        }
    
class Bag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=False)
    
    
    __table_args__ = (db.UniqueConstraint('user_id', 'listing_id', name='unique_user_listing'),)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "listing_id": self.listing_id
        }

with app.app_context():
    db.create_all()

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("Invalid token callback:", error)
    return jsonify({"msg": "Invalid token", "error": error}), 422

@jwt.unauthorized_loader
def unauthorized_callback(error):
    print("Unauthorized callback:", error)
    return jsonify({"msg": "Missing token", "error": error}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("Expired token callback")
    return jsonify({"msg": "Token has expired"}), 401

@app.route("/api/listing/label", methods = ["POST"])
@jwt_required()
def add_label():
    listing_id = request.args.get("listing_id", type=int)
    label = request.args.get("label")

    listing = db.session.get(Listing, listing_id)

    listing.label = label
    db.session.commit()

    return jsonify({"message": "Purchase successful"})

@app.route("/api/sold", methods=["POST"])
@jwt_required()
def mark_Sold():
    listing_id = request.args.get("listing_id", type=int)
    if listing_id is None:
        return jsonify({"message": "Listing ID is required"}), 400

    listing = db.session.get(Listing, listing_id)
    if not listing:
        return jsonify({"message": "Listing not found"}), 404


    allBaggedItems = Bag.query.filter_by(listing_id=listing_id).all()

    for item in allBaggedItems:
        user = db.session.get(User, item.user_id)
        if user:

            if user.total_bag_price is None:
                user.total_bag_price = 0
            user.total_bag_price -= listing.price

            if user.total_bag_price < 0:
                user.total_bag_price = 0

        db.session.delete(item)


    listing.sold = True
    db.session.commit() 

    return jsonify({"message": "Listing marked as sold!"})

@app.route("/api/sold", methods = ["GET"])
@jwt_required()
def get_sold():
    user_id = get_jwt_identity()

    listings = Listing.query.filter_by(user_id = user_id)
    soldListings = listings.filter_by(sold = True).all()

    listings_data = [listing.to_dict() for listing in soldListings]
    return jsonify(listings_data)

class SDKConfig:
    def __init__(self, api_key):
        self.api_key = api_key

        self.security = {"ShippoToken": api_key}
        self.globals = ("2018-02-08")
        self.shippo_api_version = "2018-02-08" 

sdk_config = SDKConfig(os.getenv("SHIPPO_KEY"))


@app.route("/api/shippo/transaction", methods=["POST"])
@jwt_required()
def shippo_transaction():
    data = request.get_json()
    rate_id = data.get("rate_id")
    if not rate_id:
        return jsonify({"message": "Missing rate_id"}), 400


    headers = {
        "Authorization": f"ShippoToken {SHIPPO_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "rate": rate_id,
        "label_file_type": "PDF",
        "async": False 
    }

    try:
        response = requests.post("https://api.goshippo.com/transactions/", headers=headers, json=payload)
        response_data = response.json()

        print("Status Code:", response.status_code)
        print("Response Data:", response_data)

        if response.status_code in [200, 201] and response_data.get("status") == "SUCCESS":
            return jsonify({
                "label_url": response_data.get("label_url"),
                "tracking_number": response_data.get("tracking_number")
            }), 200
        else:
            return jsonify({
                "message": "Transaction failed",
                "errors": response_data.get("messages", response_data)
            }), response.status_code

    except Exception as e:
        print("Error communicating with Shippo API:", e)
        traceback.print_exc()
        return jsonify({
            "message": "Error communicating with Shippo API",
            "error": str(e)
        }), 500

@app.route("/api/shipping", methods = ["POST"])
@jwt_required()
def get_shipping_rates():

    
    listing_id = request.args.get("listing_id", type=int)
    listing = db.session.get(Listing, listing_id)
    user_idShip = listing.user_id
    user_idRec = get_jwt_identity()
    userShipping = db.session.get(User, user_idShip)
    userRecieving = db.session.get(User,  user_idRec)
    

    address_from = userShipping.to_address()
    address_to = userRecieving.to_address()
    parcel = listing.shipping_dict()

    payload = {
        "address_from": address_from,
        "address_to": address_to,
        "parcels": [parcel],
        "async": False
    }

    headers = {
        "Authorization": f"ShippoToken {SHIPPO_API_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(SHIPPO_API_URL, headers=headers, json=payload)
        print("Status Code:", response.status_code)
        print("Response Text:", response.text)
        response_data = response.json()

        if response.status_code not in [200, 201]:
            return jsonify({
                "message" : "Error fetching shipping rates",
                "error": response_data
            }), response.status_code
        
        return jsonify({
            "message": "Shipping rates retrieved successfully",
            "rates": response_data.get("rates", response_data)
        }), 200

    except Exception as e:
        print(str(e))
        return jsonify({
            "message": "Error communicating with shipping API",
            "error": str(e)
        }), 500


@app.route("/api/user/address", methods = ["PUT"])
@jwt_required()
def update_address():
    data = request.get_json()
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    user.name = data.get("name")
    user.street1 = data.get("street1")
    user.street2 = data.get("street2")
    user.city = data.get("city")
    user.state = data.get("state")
    user.zip = data.get("zip")
    user.country = data.get("country")
    user.phone = data.get("phone")
    user.validAddress = True

    db.session.commit()
    return jsonify({"message": "address updated"}), 200
    

@app.route("/api/bag", methods=["POST"])
@jwt_required()
def add_To_Bag():
 
    data = request.get_json()
    listing_id = data.get("listing_id")
    
    if not listing_id:
        return jsonify({"message": "Missing listing_id"}), 400


    current_user_id = get_jwt_identity()
    

    existing_bag = Bag.query.filter_by(user_id=current_user_id, listing_id=listing_id).first()
    if existing_bag:
        return jsonify({"message": "User has listing in bag"}), 400
    
    userBag = User.query.get_or_404(current_user_id)
    listing = Listing.query.get_or_404(listing_id)
    userBag.total_bag_price += listing.price
    db.session.commit()

    new_Bag = Bag(user_id=current_user_id, listing_id=listing_id)
    db.session.add(new_Bag)
    db.session.commit()

    return jsonify({"message": True}), 201

@app.route("/api/bag", methods=["DELETE"])
@jwt_required()
def remove_from_bag():
    listing_id = request.args.get("listing_id")
    
    if not listing_id:
        return jsonify({"message": "Missing listing_id"}), 400

    current_user_id = get_jwt_identity()
    existing_bag = Bag.query.filter_by(user_id=current_user_id, listing_id=listing_id).first()

    if existing_bag:
    
        user_record = User.query.get_or_404(current_user_id)
        listing = Listing.query.get_or_404(listing_id)
        user_record.total_bag_price = max(user_record.total_bag_price - listing.price, 0)
        
        db.session.delete(existing_bag)
        db.session.commit()
        return jsonify({"message": "Removed from bag", "total_bag_price": user_record.total_bag_price}), 200
    else:
        return jsonify({"message": "Bagged item not found"}), 404

@app.route("/api/bag", methods = ["GET"])
@jwt_required()
def get_Bag():
    current_user_id = get_jwt_identity()

    baggedItems = Bag.query.filter_by(user_id=current_user_id).all()

    return jsonify([item.to_dict() for item in baggedItems])

@app.route("/api/bag/in", methods = ["GET"])
@jwt_required()
def get_bag_in():
    current_user_id = get_jwt_identity()
    listing_id = request.args.get("listing_id", type=int)

    baggedItem = Bag.query.filter_by(user_id=current_user_id, listing_id=listing_id).first()

    if baggedItem:
        return jsonify({"message": True})
    else:
        return jsonify({"message": False})


@app.route("/api/images/profileImage", methods = ["GET"])
def get_Profile():
    profileImage = request.args.get("profile_image_id", type=int)

    images = Image.query.filter_by(profile_image_id = profileImage).all()
    images_data = [image.to_dict() for image in images]
    return jsonify(images_data)

@app.route("/api/listing/images", methods = ["GET"])
def get_Images():
    listingId = request.args.get("listing_id", type=int)

    images = Image.query.filter_by(listing_id=listingId).order_by(Image.id.asc()).all()
    imagesArray = []

    for image in images:
        imagesArray.append(image.image_url)

    return jsonify(imagesArray)

@app.route("/api/listing/deleteImage", methods = ["DELETE"])
@jwt_required()
def delete_images():
        listing_id = request.args.get("listing_id", type=int)

        Image.query.filter_by(listing_id = listing_id).delete()
        db.session.commit()

        return jsonify({"message": "images deleted"})

@app.route("/api/listing/editImages", methods = ["PUT"])
@jwt_required()
def edit_images():
    file = request.files["image"]

    try:
        img = PilImage.open(file)
    except Exception as e:
        print("Error opening image:", e)
        return jsonify({"message": "Invalid image"}), 401
    
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) / 2
    upper = (height - min_dim) / 2
    right = left + min_dim
    lower = upper + min_dim
    cropped_img = img.crop((left, upper, right, lower))

    buffer = io.BytesIO()

    cropped_img.save(buffer, format=img.format)
    buffer.seek(0)
    
    filename = str(uuid.uuid4()) + "_" + file.filename
    bucket = os.getenv("AWS_BUCKET_NAME")

    try:
        s3_client.upload_fileobj(
            buffer,
            bucket,
            filename,
            ExtraArgs={
                "ContentType": file.content_type
            }
        )

        file_url = f"https://{bucket}.s3.{AWS_REGION}.amazonaws.com/{filename}"

        listing_id = request.form.get("listing_id")
        current_user_id = get_jwt_identity()

        new_image = Image(
            user_id = current_user_id,
            listing_id = listing_id,
            image_url=file_url
        )

        db.session.add(new_image)
        db.session.commit()
        
        return jsonify({
            "message": "Image uploaded successfully",
        }), 200
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Error uploading image", "error": str(e)}), 500





@app.route("/api/upload", methods=["POST"])
@jwt_required()
def upload_image():
  
    if "image" not in request.files:
        return jsonify({"message": "No image file provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        traceback.print_exc()
        return jsonify({"message": "No selected file"}), 400

    try:
        img = PilImage.open(file)
    except Exception as e:
        print("Error opening image:", e)
        return jsonify({"message": "Invalid image"}), 401
    
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) / 2
    upper = (height - min_dim) / 2
    right = left + min_dim
    lower = upper + min_dim
    cropped_img = img.crop((left, upper, right, lower))

    buffer = io.BytesIO()
    cropped_img.save(buffer, format=img.format)
    buffer.seek(0)
    
    filename = str(uuid.uuid4()) + "_" + file.filename
    bucket = os.getenv("AWS_BUCKET_NAME")

    try:
        s3_client.upload_fileobj(
            buffer,
            bucket,
            filename,
            ExtraArgs={
                "ContentType": file.content_type
            }
        )

        file_url = f"https://{bucket}.s3.{AWS_REGION}.amazonaws.com/{filename}"
        
        listing_id = request.form.get("listing_id")
        current_user_id = get_jwt_identity()

        if listing_id is not None and str(listing_id).strip() != "":
            listing_id = int(listing_id)
            profile_image_id = None
        else:
            listing_id = None
            profile_image_id = int(current_user_id)
        
        if not current_user_id:
            return jsonify({"message": "Missing user_id"}), 400
        
        new_image = Image(
            user_id=int(current_user_id),
            listing_id=listing_id,
            image_url=file_url,
            profile_image_id=profile_image_id
        )
        db.session.add(new_image)
        db.session.commit()
        
        return jsonify({
            "message": "Image uploaded successfully",
            "url": file_url,
            "image": new_image.to_dict()
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Error uploading image", "error": str(e)}), 500

@app.route("/api/user", methods = ["GET"])
@jwt_required()
def getUser():
    current_user_id = get_jwt_identity()

    userData = User.query.get_or_404(current_user_id)
    return jsonify(userData.to_dict())

@app.route("/api/user/details", methods = ["GET"])
def getUserDetails():
    user_id = request.args.get("user_id", type=int)

    userData = User.query.get_or_404(user_id)
    return jsonify(userData.to_dict())

@app.route("/api/user/address", methods = ["GET"])
def getUserAddress():
    user_id = request.args.get("user_id", type=int)

    userData = User.query.get_or_404(user_id)
    return jsonify(userData.to_address())

@app.route("/api/user", methods=["PUT"])
@jwt_required()
def update_user():
    data = request.get_json()
    new_name = data.get("newName")
    current_user_id = get_jwt_identity()
    
    if not new_name:
        return jsonify({"message": "Missing newName"}), 400

    user = User.query.get_or_404(current_user_id)
    user.username = new_name
    db.session.commit()
    
    return jsonify(user.to_dict()), 200
    

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400
    
    existingUser = User.query.filter((User.username == username) | (User.email == email)).first()
    if existingUser:
        return jsonify({"message": "User/email already exists"}), 400
    
    hashedPassword = generate_password_hash(password)
    newUser = User(username=username, email=email, password_hash=hashedPassword, total_bag_price = 0)
    db.session.add(newUser)
    db.session.commit()
    
    return jsonify(newUser.to_dict()), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"message": "Missing required fields"}), 400
    
    loggingInUser = User.query.filter_by(username=username).first()
    if not loggingInUser or not check_password_hash(loggingInUser.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=str(loggingInUser.id))
    return jsonify({
        "access_token": access_token,
        "user": loggingInUser.to_dict()
    }), 200

@app.route("/api/listing", methods=["GET", "POST"])
def handle_listings():
    if request.method == "POST":
        data = request.get_json()
        new_listing = Listing(
            title=data.get("title"),
            user_id=data.get("user_id"),
            price=data.get("price"),
            description=data.get("description"),
            category = data.get("category"),
            category_details = data.get("category_details"),
            size = data.get("size"),
            length = data.get("length"),
            width = data.get("width"),
            height = data.get("height"),
            weight = data.get("weight")
        )
        db.session.add(new_listing)
        db.session.commit()
        return jsonify(new_listing.to_dict()), 201
    else:
        user_id = request.args.get("user_id", type=int)
        search = request.args.get("search")
        price = request.args.get("price", type=int)

        query = Listing.query.filter_by(sold=False)
        if user_id:
            query = query.filter_by(user_id=user_id)

        if search:
            keywords = search.split()
            conditions = []
            for word in keywords:
                conditions.append(
                    or_(
                        Listing.category.ilike(f"%{word}%"),
                        Listing.category_details.ilike(f"%{word}%"),
                        Listing.title.ilike(f"%{word}%"),
                        Listing.description.ilike(f"%{word}%"),
                        Listing.size.ilike(f"%{word}%")
                    )
                )
            query = query.filter(and_(*conditions))

        if price:
            if price == 1:
                listings = query.order_by(Listing.price.desc()).all()
            else:
                listings = query.order_by(Listing.price.asc()).all()
        elif user_id:
            listings = query.order_by(Listing.date.desc()).all()
        else:

            listings = query.order_by(db.func.random()).limit(30).all()

        listings_data = [listing.to_dict() for listing in listings]
        return jsonify(listings_data)
    
    
@app.route("/api/listing/<int:listing_id>", methods=["PUT"])
def update_listing(listing_id):
    try:

        data = request.get_json()
        if not data:
            raise ValueError("No JSON payload found")
        print("Parsed data:", data)
    except Exception as e:
        print("Error parsing JSON:", e)
        return jsonify({"message": "Invalid JSON payload"}), 422


    listing = Listing.query.get_or_404(listing_id)

    listing.title = data.get("title", listing.title)
    listing.price = data.get("price", listing.price)
    listing.description = data.get("description", listing.description)
    listing.category = data.get("category", listing.category)
    listing.category_details = data.get("category_details", listing.category_details)
    listing.likes = data.get("likes", listing.likes)
    
    db.session.commit()
    return jsonify(listing.to_dict()), 200

@app.route("/api/listing/<int:listing_id>", methods=["GET"])
def view_listing(listing_id):
    listing = Listing.query.get_or_404(listing_id)
    return jsonify(listing.to_dict())

@app.route("/api/listing/<int:listing_id>", methods=["DELETE"])
def delete_listing(listing_id):

    listing = Listing.query.get_or_404(listing_id)
    listing_price = listing.price 

    bag_entries = Bag.query.filter_by(listing_id=listing_id).all()
    images = Image.query.filter_by(listing_id = listing_id).all()
    like_entries = Like.query.filter_by(listing_id = listing_id).all()
    
    for bag in bag_entries:

        user_record = db.session.get(User, bag.user_id)
        if user_record and user_record.total_bag_price is not None:

            user_record.total_bag_price = max(user_record.total_bag_price - listing_price, 0)

        db.session.delete(bag)

    for like in like_entries:
        user_record = db.session.get(User, like.user_id)
        db.session.delete(like)

    for image in images:
        db.session.delete(image)
    
    db.session.delete(listing)
    db.session.commit()
    
    return jsonify({"message": "Listing, images, likes and associated bag items deleted"}), 200

@app.route("/api/like", methods = ["GET"])
def get_like():
    user_id = request.args.get("user_id")
    listing_id = request.args.get("listing_id")

    if not user_id or not listing_id:
        return jsonify({"message": "Missing user_id or listing_id"}), 400
    
    existing_like = Like.query.filter_by(user_id=user_id, listing_id=listing_id).first()
    if existing_like:
        return jsonify({"message": True})
    else:
        return jsonify({"message": False})
    
@app.route("/api/like/all", methods=["GET"])
def get_all_likes():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"message": "Missing user_id"}), 400

    likes = Like.query.filter_by(user_id=user_id).all()
    
    liked_listings = []
    for like in likes:
        listing = Listing.query.get(like.listing_id)
        if listing:
            liked_listings.append(listing.to_dict())

    return jsonify(liked_listings), 200
        

@app.route("/api/like", methods=["POST"])
@jwt_required()
def like_listing():
    data = request.get_json()
    listing_id = data.get("listing_id")
    
    if not listing_id:
        return jsonify({"message": "Missing listing_id"}), 400

    current_user_id = get_jwt_identity()
    
    existing_like = Like.query.filter_by(user_id=current_user_id, listing_id=listing_id).first()
    if existing_like:
        return jsonify({"message": "User has already liked this listing"}), 400
    
    new_like = Like(user_id=current_user_id, listing_id=listing_id)
    db.session.add(new_like)
    db.session.commit()

    listing = Listing.query.get_or_404(listing_id)
    listing.likes += 1
    db.session.commit()

    return jsonify({"message": "Like added", "likes": listing.likes}), 201

@app.route("/api/like", methods=["DELETE"])
@jwt_required()
def unlike_listing():
    current_user_id = get_jwt_identity()
    listing_id = request.args.get("listing_id")
    
    if not  listing_id:
        return jsonify({"message": "Missing listing_id"}), 400
    
    existing_like = Like.query.filter_by(user_id=current_user_id, listing_id=listing_id).first()

    if existing_like:
        listing = Listing.query.get_or_404(listing_id)
        listing.likes = max(listing.likes - 1, 0)
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"message": "Listing unliked", "likes" : listing.likes})
    else:
        return jsonify({"message": "Like not found"}), 400


if __name__ == "__main__":
    app.run(debug=True)