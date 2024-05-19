document.getElementById('convertButton').addEventListener('click', function () {
    const shapefileInput = document.getElementById('shapefileInput');
    const output = document.getElementById('output');
    
    if (shapefileInput.files.length === 0) {
      alert('Por favor, selecciona un archivo Shapefile.');
      return;
    }
  
    const files = shapefileInput.files;
    const fileMap = {};
  
    for (const file of files) {
      if (file.name.endsWith('.shp')) {
        fileMap['shp'] = file;
      } else if (file.name.endsWith('.shx')) {
        fileMap['shx'] = file;
      } else if (file.name.endsWith('.dbf')) {
        fileMap['dbf'] = file;
      }
    }
  
    if (!fileMap['shp'] || !fileMap['shx'] || !fileMap['dbf']) {
      alert('Por favor, selecciona los archivos .shp, .shx, y .dbf.');
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = function (e) {
      const shpBuffer = e.target.result;
  
      const shxReader = new FileReader();
      shxReader.onload = function (e) {
        const shxBuffer = e.target.result;
  
        const dbfReader = new FileReader();
        dbfReader.onload = function (e) {
          const dbfBuffer = e.target.result;
  
          shapefile.open(shpBuffer, shxBuffer, dbfBuffer)
            .then(source => source.read()
              .then(function log(result) {
                if (result.done) return;
                const geojson = {
                  type: "FeatureCollection",
                  features: []
                };
  
                const feature = {
                  type: "Feature",
                  geometry: result.value.geometry,
                  properties: result.value.properties
                };
                geojson.features.push(feature);
  
                source.read().then(log);
                output.textContent = JSON.stringify(geojson, null, 2);
              }))
            .catch(error => console.error(error));
        };
        dbfReader.readAsArrayBuffer(fileMap['dbf']);
      };
      shxReader.readAsArrayBuffer(fileMap['shx']);
    };
    reader.readAsArrayBuffer(fileMap['shp']);
  });
  