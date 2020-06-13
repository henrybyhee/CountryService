# CountryService

A simple country service written in Node.js with authentication module. 

# Features

- User can log in or sign up and receive access token and refresh token if successful.
- User can request for new access token with a valid refresh token. Access token is valid for 5 mins while refresh token is valid for 14 days.
- Each user is only assigned a pair of access token and refresh tokens. Previous tokens will be revoked.
- User can fetch list of countries with pagination, limit and order.
- User can fetch a country detail
- User is denied access to server if access token is not provided or invalid.

# Installation

1. Build Docker image
   ```bash
   make build
   ```
2. Start services
   ```
   docker-compose up
   ```
3. Seed country data
   ```
   make seed-data
   ```
4. Server should be listening at `localhost:3000`


# API

## Authentication

### 1. SIGN UP

POST /oauth/signup/

*Request Body*
```json
{
    "email": "user@domain.com",
    "password": "123456789"
}
```
- `email`: Mandatory.
- `password`: Must be >= 9 characters long.


*Response*
1. 201 Success
   ```json
    {
        "accessToken": "",
        "refreshToken": "",
    }
   ```
2. 422 Unprocessed Entity. Possible causes: used email, incorrect user input.
   ```json
   {
       "errors": [{...}]
   }
   // OR
   {
       "error": ""
   }
   ```
3. 500 Internal Server Error. Possible causes: Uncaught Errors.
    ```
    {
       "error": ""
   }
    ```

### 2. LOGIN

POST /oauth/signup/

*Request Body*
```json
{
    "email": "user@domain.com",
    "password": "123456789"
}
```
- `email`: Mandatory.
- `password`: Must be >= 9 characters long.


*Response*
1. 201 Success
   ```json
    {
        "accessToken": "",
        "refreshToken": "",
    }
   ```
2. 422 Unprocessed Entity. Possible causes: incorrect user input, Wrong password
   ```json
   {
       "errors": [{...}]
   }
   // OR
   {
       "error": "Wrong password"
   }
3. 404 Not Found. Possible causes: User is not registered.
    ```json
    {
        "error": "User not found"
    }
    ```
4. 500 Internal Server Error. Possible causes: Uncaught Errors.
    ```
    {
       "error": ""
   }
    ```

### 3. REFRESH TOKEN

POST /oauth/refresh/

*Request Body*
```json
{
    "refreshToken": "XXX"
}
```

*Response*
1. 201 Success
    ```json
    {
        "accessToken": "",
        "refreshToken": ""
    }
    ```
    Side effects: 
      - Previous access tokens that belong to the user will be revoked.
2. 404 Not Found. Possible causes: Token not found, user not found.
    ```json
    {
        "error": "Token is not found | User not found".
    }
    ```
3. 403 Forbidden. Possible causes: refresh token revoked, verify failed, refresh token expired.
    ```json
    {
        "error": ""
    }
    ```
4. 500 Internal Server Error. Possible causes: Uncaught Errors.
    ```json
    {
       "error": ""
   }
    ```


## Country

### 1. GET COUNTRY DETAIL

GET /api/countries/{name}

Note:
  - Access Token to be added as bearer token.


*Response*
1. 200 Success
    ```json
    {
        "data":{
            "id": 1,
            "name": "SINGAPORE",
            "timezone": "Asia/Singapore",
            "offset": 8
        }
    }
    ```
2. 404 Not Found. Possible causes: Country not found.
    ```json
    {
        "error": "Country not found".
    }
    ```
3. 403 Forbidden. Possible causes: access token revoked/ expired/ invalid.
    ```json
    {
        "error": ""
    }
    ```
4. 500 Internal Server Error. Possible causes: Uncaught Errors.
    ```json
    {
       "error": ""
   }
    ```

### 2. LIST COUNTRIES

GET /api/countries/

Note:
  - Access Token to be added as bearer token.

*Request Parameters*
1. sort: Field to sort by
    - `id`, `name`, `timezone`, `offset` (ascending)
    - `-id`, `-name`, `-timezone`, `-offset` (descending)
2. limit: Pagination. Default 10.
    - Min=0, Max=Infinite
3. offset: starting row. Default 0


*Response*
1. 200 Success
    ```json
    {
        "data":[{
            "id": 1,
            "name": "SINGAPORE",
            "timezone": "Asia/Singapore",
            "offset": 8
        },...]
    }
    ```

3. 403 Forbidden. Possible causes: access token revoked/ expired/ invalid.
    ```json
    {
        "error": ""
    }
    ```
4. 500 Internal Server Error. Possible causes: Uncaught Errors.
    ```json
    {
       "error": ""
   }
    ```

# TODO

- Add integration test
- Separate Authorization module into a microservice that handles token generation and oauth2.0 flow.
- Add functions to filter countries based on attributes.