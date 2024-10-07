#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const program = new Command();

let executed = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

program
  .name('generate')
  .description('CLI para generar múltiples microservicios con CRUD')
  .version('1.0.0');

program
  .command('services')
  .description('Genera una carpeta de microservicios con múltiples servicios CRUD')
  .action(() => {
    if (executed) return;
    executed = true;
    
    console.log("Iniciando creación de la carpeta 'Services'...");
    const servicesPath = path.join(process.cwd(), 'Services');

    if (!fs.existsSync(servicesPath)) {
      console.log("La carpeta 'Services' no existe. Creándola...");
      fs.mkdirSync(servicesPath);
      console.log(`Carpeta principal 'Services' creada en: ${servicesPath}`);
    } else {
      console.log(`La carpeta 'Services' ya existe en: ${servicesPath}`);
    }

    rl.question('¿Cuántos servicios quieres crear? ', (num) => {
      const serviceCount = parseInt(num);
      if (isNaN(serviceCount) || serviceCount <= 0) {
        console.log('Por favor ingresa un número válido.');
        rl.close();
        process.exit(0);
        return;
      }

      const serviceNames = [];
      
      const getServiceName = (index) => {
        if (index >= serviceCount) {
          rl.close();
          createServices(serviceNames);
          return;
        }

        rl.question(`Nombre del servicio ${index + 1}: `, (name) => {
          if (!name) {
            console.log('El nombre del servicio no puede estar vacío.');
            getServiceName(index);
          } else {
            serviceNames.push(name);
            getServiceName(index + 1);
          }
        });
      };

      getServiceName(0);
    });

    const createServices = (serviceNames) => {
      serviceNames.forEach(serviceName => {
        const servicePath = path.join(servicesPath, serviceName);

        if (fs.existsSync(servicePath)) {
          console.log(`El servicio "${serviceName}" ya existe. Omitiendo creación.`);
          return;
        }

        try {
          console.log(`Generando microservicio para ${serviceName} en la ruta: ${servicePath}`);

          // Crear la estructura de carpetas del microservicio
          const folders = [
            `${servicePath}/controllers`,
            `${servicePath}/models`,
            `${servicePath}/routes`,
            `${servicePath}/config`
          ];

          folders.forEach(folder => {
            fs.mkdirSync(folder, { recursive: true });
          });

          // Crear archivos básicos de CRUD en el microservicio
          fs.writeFileSync(`${servicePath}/controllers/${serviceName}Controller.js`, crudControllerTemplate(serviceName));
          fs.writeFileSync(`${servicePath}/models/${serviceName}.js`, crudModelTemplate(serviceName));
          fs.writeFileSync(`${servicePath}/routes/${serviceName}.js`, crudRoutesTemplate(serviceName));

          console.log(`Microservicio ${serviceName} generado en: ${servicePath}`);
        } catch (error) {
          console.error(`Error al generar el servicio ${serviceName}:`, error);
        }
      });
      process.exit(0); // Salir después de crear los servicios
    };
  });

  program
  .command('api <apiName>')
  .description('Genera una API con conexión a base de datos')
  .action((apiName) => {
    const apiPath = path.join(process.cwd(), apiName);
    
    if (fs.existsSync(apiPath)) {
      console.log(`La API "${apiName}" ya existe. Por favor, elige otro nombre o elimina la API existente.`);
      process.exit(0);
      return;
    }

    console.log(`Generando API para ${apiName} en la ruta: ${apiPath}`);

    try {
      const folders = [
        `${apiPath}/controllers`,
        `${apiPath}/routes`,
        `${apiPath}/config`
      ];

      folders.forEach(folder => {
        fs.mkdirSync(folder, { recursive: true });
      });

      fs.writeFileSync(`${apiPath}/controllers/${apiName}Controller.js`, apiControllerTemplate());
      fs.writeFileSync(`${apiPath}/routes/${apiName}.js`, apiRoutesTemplate());
      fs.writeFileSync(`${apiPath}/config/database.js`, databaseConfigTemplate());

      console.log(`API ${apiName} generada en: ${apiPath}`);
    } catch (error) {
      console.error(`Error al generar la API ${apiName}:`, error);
    }

    process.exit(0);
  });


program.parse(process.argv);

function crudControllerTemplate(name) {
  return `
const ${name} = require('../models/${name}');

// Función para crear un nuevo registro
exports.create = (req, res) => {
  // Lógica de creación
};

// Función para obtener todos los registros
exports.findAll = (req, res) => {
  // Lógica para obtener todos los registros
};

// Función para obtener un registro por ID
exports.findOne = (req, res) => {
  // Lógica para obtener un registro por ID
};

// Función para actualizar un registro por ID
exports.update = (req, res) => {
  // Lógica de actualización
};

// Función para eliminar un registro por ID
exports.delete = (req, res) => {
  // Lógica de eliminación
};
`;
}

function crudModelTemplate(name) {
  return `
const mongoose = require('mongoose');

const ${name}Schema = new mongoose.Schema({
  // Definición del esquema
});

module.exports = mongoose.model('${name}', ${name}Schema);
`;
}

function crudRoutesTemplate(name) {
  return `
const express = require('express');
const router = express.Router();
const ${name}Controller = require('../controllers/${name}Controller');

// Rutas CRUD
router.post('/', ${name}Controller.create);
router.get('/', ${name}Controller.findAll);
router.get('/:id', ${name}Controller.findOne);
router.put('/:id', ${name}Controller.update);
router.delete('/:id', ${name}Controller.delete);

module.exports = router;
`;
}

function apiControllerTemplate() {
  return `
exports.hello = (req, res) => {
  res.json({ message: "Hello, World!" });
};
`;
}

function apiRoutesTemplate() {
  return `
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Endpoint /hello
router.get('/hello', apiController.hello);

module.exports = router;
`;
}

function databaseConfigTemplate() {
  return `
// Configuración de conexión de la base de datos
module.exports = {
  url: 'mongodb://localhost:27017/miBaseDeDatos'
};
`;
}