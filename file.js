const fs = require('fs');
const path = require('path');

function resetFolders() {
    const folders = ['uploads', 'output'];

    folders.forEach(folder => {
        const folderPath = path.join(__dirname, folder);

        // Check if the folder exists
        if (fs.existsSync(folderPath)) {
            // Remove the folder and its contents
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`Deleted folder: ${folder}`);
        }

        // Recreate the folder
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created folder: ${folder}`);
    });
}

// Call the function
resetFolders();
