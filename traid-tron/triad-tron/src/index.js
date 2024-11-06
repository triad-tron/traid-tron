import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Admin from './components/admin';
import Publisher from './components/publisher';
import Advertiser from './components/advertiser';
import Site from './components/site';
import Header from './components/Header/Header.js';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';


ReactDOM.render(
  <Router>
    <Header />
    <Routes>
    <Route path="/" element={<App />} /> 
      <Route path="/admin" element={<Admin />} />
      <Route path="/publisher" element={<Publisher />} />
      <Route path="/advertisers" element={<Advertiser />} />
      <Route path="/site" element={<Site />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

