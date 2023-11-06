const axios = require("axios"); // Importa el módulo 'axios'
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
            // Escribir los resultados modificados en un nuevo archivo CSV
            const writeStream = fs.createWriteStream(outputFile);
            writeStream.write(
              "#, Nombre de cliente/proveedor;(L) Descripción Local;Dirección;Comuna;Ciudad;(L) Región;lat;lng\n"
            ); // Escribir el encabezado

            let currentIndex = 0;

            function processNextRow() {
              if (currentIndex < results.length) {
                const row = results[currentIndex];
                const address = `Chile ${row.Comuna} ${row["Dirección"]}`;
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
                        writeStream.write(
                          `${row["#"]};${row["Nombre de cliente/proveedor"]};${
                            row["(L) Descripción Local"]
                          };${row["Dirección"]};${row["Comuna"]};${
                            row["Ciudad"]
                          };${
                            row["(L) Región"]
                          };${lat.toString()};${lng.toString()}\n`
                        ); // Escribir cada fila
                      } else {
                        console.log(
                          `Dato: ${row["Nombre de cliente/proveedor"]}`
                        );
                        console.log(`Direccion: ${address}`);
                        console.error(
                          "No se encontraron resultados para la dirección."
                        );
                        writeStream.write(
                          `${row["Nombre de cliente/proveedor"]};${row["(L) Descripción Local"]};${row["Dirección"]};${row["Comuna"]};${row["Ciudad"]};${row["(L) Región"]};${row.lat};${row.lng}\n`
                        ); // Escribir cada fila
                      }
                    } else {
                      console.error(
                        `Error en la solicitud: ${response.status}`
                      );
                    }

                    // Procesar la siguiente fila después del retraso
                    currentIndex++;
                    setTimeout(processNextRow, 500); // Esperar 500 ms antes de la siguiente solicitud
                  })
                  .catch((error) => {
                    console.error(`Error: ${error.message}`);
                    writeStream.write(
                      `${row["#"]};${row["Nombre de cliente/proveedor"]};${row["(L) Descripción Local"]};${row["Comuna"]};${row["(L) Región"]};${row["Dirección"]};${row["(L) Cadena"]};${row.lat};${row.lng}\n`
                    ); // Escribir cada fila

                    // Procesar la siguiente fila después del retraso
                    currentIndex++;
                    setTimeout(processNextRow, 500); // Esperar 500 ms antes de la siguiente solicitud
                  });
              } else {
                // Todas las filas han sido procesadas
                console.log("Archivo CSV modificado creado exitosamente.");
              }
            }

            // Comenzar el procesamiento de la primera fila
            processNextRow();
          });
      }
    );
  }
);
