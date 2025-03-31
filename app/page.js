import React from "react";
import DashboardNavbar from "./components/navbar";
import Details from "./components/details";
import ProductList from "./components/products-list";

function App() {
  return (
    <>
      <DashboardNavbar />
      <Details />
      <ProductList />
    </>
  );
}

export default App;
