# Address Search App

This application is designed to read a CSV file containing address data and perform geocoding using the Google Maps API. It requires Node.js and a few specific columns in the CSV to function properly.

## How to Use

1. **Installation:**
   After cloning the repository, run the following command in the root directory to install the required dependencies:

npm intall

2. **Preparing CSV File:**
Place the CSV file in the root directory of the repository. Ensure the CSV file adheres to the following column titles:

Nombre,Descripción Local,Comuna,Region,Direccion,Cadena,Categoria,CategoriaID

3. **Setting up the Google Maps API Key:**
   - Make a copy of the `.env.copy` file provided in the repository.
   - Rename the copied file to `.env`.
   - Open the `.env` file and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key.
   - This key is required for the application to function properly as it accesses the Google Maps API for geocoding.


4. **Running the Application:**
Execute the following command to start the application:

node addressSearch.js


4. **Client Input:**
The application will prompt you to enter the name of the CSV file to read and the desired output file name. Ensure the file names are entered accurately.

5. **Note:**
- Please make sure to have a stable internet connection, as the application uses the Google Maps API for geocoding.
