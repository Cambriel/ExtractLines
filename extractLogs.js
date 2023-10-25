const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const rootDirectory = 'UEBER-ORDNER OHNE / AM ENDE'; //dabei immer / als Seperator. Bsp.: C:/User/stephan/ueber
const outputCsvFile = 'OUTPUT PFAD!'; // dabei wieder / als Seperator. Bsp.: C:/User/stephan/liste.csv
const fileName = 'test.LOK' //wie heißen die Dateien? (ALLE NAMEN MUESSEN EINHEITLICH SEIN!)

const csvWriter = createCsvWriter({
    path: outputCsvFile,
    header: [
        { id: 'Ordner', title: 'Ordner' },
        { id: 'Anwender', title: 'Anwender' },
        { id: 'ComPort', title: 'ComPort' },
        { id: 'GeraeteTyp', title: 'GeraeteTyp' },
        { id: 'PrinterCopies', title: 'PrinterCopies' },
    ],
});

const data = [];


function extractAttributes(content) {

    const attributes = {
        Anwender: '',
        ComPort: '',
        GeraeteTyp: '',
        PrinterCopies: '',
    };

    // Split content into lines
    const lines = content.split('\r\n');

    for (const line of lines) {
        if(line.length >=1 ){
            if(line.split('=').length == 2){
                const [key, value] = line.split('=');
                console.log([key, value]);
                if(key in attributes){
                    attributes[key] = value;
                }
            }
        }
    }
    return attributes;
}


function traverseDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = `${directoryPath}/${file}`;

        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // If it's a directory, recursively traverse it
            traverseDirectory(filePath);
        } else if (file === fileName) {
            // If it's the data.txt file, read its content and extract attributes
            const content = fs.readFileSync(filePath, 'utf8');
            const attributes = extractAttributes(content);

            const dir = directoryPath.split('/').pop();
            data.push({
                Ordner: dir,
                Anwender: attributes.Anwender,
                ComPort: attributes.ComPort,
                GeraeteTyp: attributes.GeraeteTyp,
                PrinterCopies: attributes.PrinterCopies,
            });
        }
    }
}

traverseDirectory(rootDirectory);

csvWriter.writeRecords(data)
    .then(() => {
        console.log('CSV file has been written successfully.');
    })
    .catch((error) => {
        console.error('Error writing CSV:', error);
    });