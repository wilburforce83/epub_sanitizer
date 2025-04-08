# epub_sanitizer Installation and Usage

**epub_sanitizer** is an open-source tool designed to automatically process and organize EPUB files by extracting metadata and appropriately renaming and moving them. This project is licensed under the GNU General Public License.​

It is designed to be super light-weight for people who want to manage their library without Calibre, for example I use Kavita for both comics and books, this renames and organises any downloaded book into a folder structure for Kavita, but it works for any ebook front-end that has a library folder.

## Features

- Extracts metadata (title, author, etc.) from EPUB files.
    
- Renames files in the format "Title_Author.epub".​
    
- Organizes files into folders based on metadata (using series or author).​
    
- Processes existing files and monitors directories for new files.​
    
- Can be managed using PM2 for production environments.​
    

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)​
    
- [npm](https://www.npmjs.com/)​
    
- [PM2](https://pm2.keymetrics.io/) (optional, recommended for production)​
    

## Installation

1. **Clone the Repository:**
    
    bash
    
    CopyEdit
    
    ```
    git clone https://github.com/wilburforce83/epub_sanitizer.git 
    cd epub_sanitizer
    ```
    

2. **Install Dependencies:**
    
    bash
    
    CopyEdit
    
    `npm install`
    

3. **Configure Environment Variables:**
    
    Create a `.env` file in the root of your project with the following content:
    
    ini
    
    CopyEdit
    
    `ROOT_DIR=/path/to/your/epub/folder`
    

Replace `/path/to/your/epub/folder` with the full path to your EPUB files directory.

## Running the Application

### Running Directly

For testing purposes, run the script directly with Node.js:​

bash

CopyEdit

`node organizeBooks.js`

This command processes all EPUB files in `ROOT_DIR` and then watches the folder for new files.​

### Running with PM2

To run **epub_sanitizer** as a persistent process using PM2:​

1. **Install PM2 Globally (if not already installed):**
    
    bash
    
    CopyEdit
    
    `npm install -g pm2`
    

2. **Start the Application with PM2:**
    
    bash
    
    CopyEdit
    
    `pm2 start organizeBooks.js --name epub_sanitizer`
    

3. **Manage the Process:**
    
    - **View PM2 Status:**
        
        bash
        
        CopyEdit
        
        `pm2 status`
        
    - **View Logs:**
        
        bash
        
        CopyEdit
        
        `pm2 logs epub_sanitizer`
        
    - **Stop the Process:**
        
        bash
        
        CopyEdit
        
        `pm2 stop epub_sanitizer`
        
    - **Restart the Process (for updates):**
        
        bash
        
        CopyEdit
        
        `pm2 restart epub_sanitizer`
        
    - **Save the PM2 Process List (to start on reboot):**
        
        bash
        
        CopyEdit
        
        `pm2 save`
        
    - **Configure PM2 to Start on System Boot:**
        
        bash
        
        CopyEdit
        
        `pm2 startup`
        
        Follow the on-screen instructions to complete the setup.
        

## License

This project is licensed under the GNU General Public License. See the [LICENSE](https://github.com/wilburforce83/epub_sanitizer/blob/main/LICENSE) file for details.​

## Contributing

Contributions are welcome! Please open issues or pull requests as needed.​

## Contact

For questions or support, please open an issue on GitHub.