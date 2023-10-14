# Read Me
first git clone the pacakge 
then install all package with 
~~~
npm i
npm start
~~~
#### Following dependencies is required
* Node 18+
* Redis
* Mongo

#### Features
* Swagger UI for endpoints
* Rate-Limiter
* Schame using mongoose
* Passport-js for auth
* Redis for logout system
* Test cases for 429 status code is also available


#### All endpoints can be found in 
~~~
http://localhost:3000/api-docs
~~~

### env file format
NODE_ENV = dev
MONGO_URL = mongodb://localhost:27017
AUTH_KEY = secet_key
