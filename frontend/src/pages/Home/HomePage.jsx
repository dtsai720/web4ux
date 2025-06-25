import React from 'react';
import { Header, NavigationButtons } from '../../components/home';

const HomePage = ({ navigate }) => (
  <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
    <Header />
    <NavigationButtons navigate={navigate} />
  </div>
);

export default HomePage;
