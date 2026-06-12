import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import RutaProtegida from "./components/auth/RutaProtegida";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalogo from "./pages/comprador/Catalogo";
import PedidosComprador from "./pages/comprador/Pedidos";
import Proveedores from "./pages/vendedor/Proveedores";
import Carrito from "./pages/vendedor/Carrito";
import Pedidos from "./pages/vendedor/Pedidos";
import Inventario from "./pages/vendedor/Inventario";
import Ventas from "./pages/vendedor/Ventas";
import DespachosVendedor from "./pages/vendedor/DespachosVendedor";
import ProductosProveedor from "./pages/proveedor/ProductosProveedor";
import FacturasProveedor from "./pages/proveedor/FacturasProveedor";
import DespachosProveedor from "./pages/proveedor/DespachosProveedor";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<RutaProtegida />}>
                            <Route element={<Layout />}>
                                <Route
                                    element={
                                        <RutaProtegida
                                            rolesPermitidos={["comprador"]}
                                        />
                                    }
                                >
                                    <Route
                                        path="/comprador/catalogo"
                                        element={<Catalogo />}
                                    />
                                    <Route
                                        path="/comprador/carrito"
                                        element={<Carrito />}
                                    />
                                    <Route
                                        path="/comprador/pedidos"
                                        element={<PedidosComprador />}
                                    />
                                </Route>

                                <Route
                                    element={
                                        <RutaProtegida
                                            rolesPermitidos={["vendedor"]}
                                        />
                                    }
                                >
                                    <Route
                                        path="/vendedor/proveedores"
                                        element={<Proveedores />}
                                    />
                                    <Route
                                        path="/vendedor/carrito"
                                        element={<Carrito />}
                                    />
                                    <Route
                                        path="/vendedor/pedidos"
                                        element={<Pedidos />}
                                    />
                                    <Route
                                        path="/vendedor/inventario"
                                        element={<Inventario />}
                                    />
                                    <Route
                                        path="/vendedor/ventas"
                                        element={<Ventas />}
                                    />
                                    <Route
                                        path="/vendedor/despachos"
                                        element={<DespachosVendedor />}
                                    />
                                </Route>

                                <Route
                                    element={
                                        <RutaProtegida
                                            rolesPermitidos={["proveedor"]}
                                        />
                                    }
                                >
                                    <Route
                                        path="/proveedor/productos"
                                        element={<ProductosProveedor />}
                                    />
                                    <Route
                                        path="/proveedor/facturas"
                                        element={<FacturasProveedor />}
                                    />
                                    <Route
                                        path="/proveedor/despachos"
                                        element={<DespachosProveedor />}
                                    />
                                </Route>
                            </Route>
                        </Route>

                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;