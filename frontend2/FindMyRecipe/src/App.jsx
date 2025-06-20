import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/Auth/LoginPage";
import RegistrationPage from "./components/Auth/RegistrationPage";
import Intro from "./components/Home/Intro";
import IngredientSearchPage from "./components/Home/IngredientSearchPage";
import RecipeSearchPage from "./components/Home/RecipeSearchPage";
import UploadRecipePage from "./components/Home/UploadRecipePage";
import Navbar from './components/Home/Navbar';
import ProfilePage from './components/Home/ProfilePage';
import ForgotPassword from "./components/Auth/ForgotPassword";
import  Recipefind  from "./components/Test/Recipefind";
import RecipeView from "./components/Test/RecipeViewPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<Intro />} />
      <Route path="/ingredients" element={<IngredientSearchPage />} />
      <Route path="/search" element={<RecipeSearchPage />} />
      <Route path="/upload" element={<UploadRecipePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/Recipefind" element={<Recipefind/>}/>
      <Route path="/recipe/:name" element={<RecipeView />} />
    </Routes>
  );
}

export default App;
