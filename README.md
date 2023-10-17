# Avanti Gurukul

Welcome to Gurukul, a product of Avanti.

## Getting Started

To run the development server, follow these steps:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/avantifellows/gurukul
   ```

2. Navigate to the project directory:

    ```bash
    cd path-to-gurukul-app
    ```

3. Install the project dependencies:

    ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Instructions for testing locally

1. Navigate to the portal-backend directory:

    ```bash
    cd path-to-portal-backend-app
    ```

2. Start the application server by running:

    ```bash
    cd app; uvicorn main:app --reload
    ```

3. Add gurukul origin to the CORS allowed origins array in `main.py`:

    `
        origins = ["http://localhost:3000"]
    `

4. Portal frontend will be responsible for setting up the token in browser cookies. For setting token manually:
    i: Create an access token first through portal backend using `http://localhost:8000/docs#/Authentication/create_access_token_auth_create_access_token_post`.    You can adjust the `type` in body to be `user`.

    ii: Once the access token is generated, you need to set it in the browser cookies [Note: Since cookies are subject to the same-origin policy so try to set in the `localhost:3000` only, otherwise  you need to make changes in the portal-frontend such that they could share their resource with other domains if token generation is done from frontend]

    iii: On refreshing the page, it would show `Welcome to gurukul` if the token is correct else it would show `User not logged in`
