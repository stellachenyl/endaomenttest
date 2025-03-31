# Endaoment Test DAF

## Overview

The **Endaoment Test DAF** demonstrates the integration and usage of the **DAF-as-a-Service (DaaS)** API, a comprehensive solution for managing Donor-Advised Funds (DAFs). The project provides a simplified system that allows users to create and manage DAFs, make donations, and grant funds to selected organizations. It also offers the capability to search and interact with organizations and provides an essential structure for interacting with the **Endaoment API**.

The project includes both backend and frontend components designed to showcase the functionality of DAF creation, fund management, and interactions such as donations and grants.

## Key Features

### Backend:
- **Create DAF (Donor-Advised Fund)**: Allows users to create a new DAF with associated advisor details and a USDC balance.
- **Authentication and Authorization**: Uses OAuth 2.0 for user authentication and securely stores access tokens.
- **Wire Donation**: Users can send wire donations to a selected DAF using a simple donation interface.
- **Grant from DAF**: Users can select a DAF and grant funds to an organization, specifying the purpose and amount of the grant.

### Frontend:
- **DAF Creation Interface**: A simple form to create a new DAF and add basic details such as the fund name, description, and advisor details.
- **DAF List and Selection**: Displays a list of available DAFs, allowing users to select one to make donations or grants.
- **Grant Form**: A form that allows users to select an organization to grant to and specify the amount and purpose of the grant.
- **Search for Organizations**: A searchable list of organizations that users can select to donate or grant to, using filters and pagination.

## Project Structure

### Backend (Express.js)
- **routes**: Contains route handlers for all the main endpoints (e.g., `/create-daf`, `/grant`, `/get-dafs`).
- **controllers**: Defines functions for managing DAF creation, handling donations, and grants.
- **utils**: Contains helper functions for managing authentication tokens and interacting with the Endaoment API.
- **models**: In-memory data storage for storing DAFs, user details, and related information for testing purposes.

### Frontend (React.js)
- **components**: Includes React components for the main UI components, such as the DAF list, donation form, grant form, and organization search.
- **utils**: Contains utility functions for interacting with the backend (e.g., `useSearch` for organization search).
- **api**: Handles all API calls to the backend for actions like fetching DAFs and performing donations and grants.
- **hooks**: Custom hooks for fetching data from the backend and handling state updates.

## Setup Instructions

### Backend Setup:
1. **Install dependencies**:
   To set up the backend, install ```Node 22.11.0```, ```yarn```, and ```yarn install```.

2. **Configure Environment Variables**:
    Ensure you have a `.env` file at the root of the project with the following variables:

    ```ENDAOMENT_CLIENT_ID=your_client_id
    ENDAOMENT_CLIENT_SECRET=your_client_secret
    ENDAOMENT_REDIRECT_URI=http://localhost:5454/verify-login
    FRONTEND_URL=http://localhost:3000```

3. **Run the backend server**:
    Start the Express server by running:
    ```yarn start```

    The backend will be available at `http://localhost:5454`.

### Frontend Setup:
1. **Install dependencies**:
    To set up the frontend, install the required dependencies, same as backend.

2. **Configure Environment Variables**:
    Ensure you have a `.env` file with the following:
    ```SAFE_ENDAOMENT_ENVIRONMENT=development # or production
    SAFE_BACKEND_URL=http://localhost:5454```

3. **Run the frontend**:
    Start the React app by running:
    ```yarn dev```

The frontend will be available at `http://localhost:3000`.

### Testing the System:

Create a DAF: Use the /create-daf endpoint on the backend to create a new DAF by providing a name, description, and advisor details.

Search for Organizations: Use the search functionality to find organizations you wish to donate or grant to. The search functionality includes a pagination feature to load more results.

Make a Donation: Select a DAF and specify the amount for the donation. The system will handle the donation through the /wire-donation endpoint.

Grant Funds: Select a DAF and an organization, then provide the amount and purpose of the grant. Submit the form to initiate the grant using the /grant endpoint.

### Known Issues and Limitations

Stock Donation Feature: The functionality for stock donations is mentioned in the documentation but was not fully implemented or tested in this project.

Security Considerations: This implementation does not fully address security concerns and should not be used in a production environment without additional security measures.

Incomplete Test Coverage: Certain features, such as stock donations and detailed error handling, were not fully tested due to the limitations in the available documentation and the time constraints.

### Future Enhancements

Enhanced Security: Implement security best practices to ensure safe handling of sensitive data and financial transactions.

Full Implementation of Stock Donations: Expand the functionality to allow stock donations, including integration with third-party APIs for handling stock transactions.

Scalability: Improve the system to handle larger volumes of data and users by optimizing performance and considering architectural changes to support scaling.