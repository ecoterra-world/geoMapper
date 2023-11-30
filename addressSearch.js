const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const readline = require("readline");
require('dotenv').config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let inputFile, outputFile;

rl.question(
  "Ingrese el nombre del archivo a leer (ej. Datos1.csv): ",
  (inputFileName) => {
    inputFile = inputFileName;
    rl.question(
      "Ingrese el nombre del archivo de salida: ",
      (outputFileName) => {
        outputFile = outputFileName;

        rl.close(); // Cerrar la entrada estándar

        const results = [];

        fs.createReadStream(inputFile)
          .pipe(csv())
          .on("data", (data) => {
            results.push(data);
          })
          .on("end", () => {
            const outputData = [];

            let currentIndex = 0;

            function processNextRow() {
              if (currentIndex < results.length) {
                const row = results[currentIndex];
                const address = `Chile ${row['Region']} ${row['Comuna']} ${row['Direccion']}`;
                const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;

                axios
                  .get(url)
                  .then((response) => {
                    if (response.status === 200) {
                      const data = response.data;
                      if (data.status === "OK") {
                        const location = data.results[0].geometry.location;
                        const lat = location.lat;
                        const lng = location.lng;

                        console.log(`Latitud: ${lat}, Longitud: ${lng}`);
                        row.lat = lat;
                        row.lng = lng;
                        outputData.push(row);
                      } else {
                        console.log(
                          `Dato: ${row["Nombre de cliente/proveedor"]}`
                        );
                        console.log(`Direccion: ${address}`);
                        console.error(
                          "No se encontraron resultados para la dirección."
                        );
                        outputData.push(row);
                      }
                    } else {
                      console.error(
                        `Error en la solicitud: ${response.status}`
                      );
                      outputData.push(row);
                    }

                    // Procesar la siguiente fila después del retraso
                    currentIndex++;
                    setTimeout(processNextRow, 500); // Esperar 500 ms antes de la siguiente solicitud
                  })
                  .catch((error) => {
                    console.error(`Error: ${error.message}`);
                    outputData.push(row);

                    // Procesar la siguiente fila después del retraso
                    currentIndex++;
                    setTimeout(processNextRow, 500); // Esperar 500 ms antes de la siguiente solicitud
                  });
              } else {
                // Todas las filas han sido procesadas
                const jsonOutput = JSON.stringify(outputData, null, 2);
                fs.writeFileSync(outputFile, jsonOutput);
                console.log("Datos guardados en formato JSON exitosamente.");
              }
            }

            // Comenzar el procesamiento de la primera fila
            processNextRow();
          });
      }
    );
  }
);
