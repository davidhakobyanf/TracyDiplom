# Task Invoices

Welcome to Task Invoices, a simple and efficient way to manage invoices related to user tasks.

## Description

Task Invoices is designed to help users securely manage and view their invoices. The application includes the following features:

### Secure Registration
Users can securely log in using their username and password. The application verifies credentials against the "Users" table.

### Invoice Management
After logging in, users can view their specific invoices. The "Total Amount" column in the "Invoices" table is calculated as the sum of the "total amounts" from related invoice lines.

### Detailed Invoice Information
Users can select an invoice to view detailed invoice lines associated with that invoice. This feature helps in understanding the breakdown of the total amount.

## Project Structure

The project consists of two main pages:

1. **Registration Page**: Allows users to log in using their username and password.
2. **Invoice Page**: Displays invoices related to the logged-in user and detailed invoice lines upon selection.

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

Ensure you have the following installed:
- A modern web browser (e.g., Chrome, Firefox, Safari)
- An active internet connection

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/davidhakobyanf/taskinvoices.git
    ```
2. Navigate to the project directory:
    ```sh
    cd taskinvoices
    ```

### Running the Application

1. Navigate to the project directory:
    ```sh
    cd taskinvoices
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the application:
    ```sh
    npm start
    ```
4. Open your web browser and go to `http://localhost:3000`. The login screen will appear. Enter your username and password to log in.

## Data Sources

The application retrieves data from the following OData endpoints:

- **Users**: [Users Data](https://bever-aca-assignment.azurewebsites.net/users)
- **Products**: [Products Data](https://bever-aca-assignment.azurewebsites.net/products)
- **Invoices**: [Invoices Data](https://bever-aca-assignment.azurewebsites.net/invoices)
- **Invoice Lines**: [Invoice Lines Data](https://bever-aca-assignment.azurewebsites.net/invoicelines)

