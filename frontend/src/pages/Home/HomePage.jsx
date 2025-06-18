import React from 'react';
import { Header, NavigationButtons } from '../../components/home';

const HomePage = ({ setCurrentPage }) => (
  <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
    <Header />
    <NavigationButtons setCurrentPage={setCurrentPage} />
  </div>
);

export default HomePage;
