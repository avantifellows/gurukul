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

    ```    origins = ["http://localhost:3000"]
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`.
