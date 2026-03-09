import React from "react";
import "./navbar.css";
import { Link } from "react-router";
import uk from "../../images/uk.png";
import china from "../../images/china.png";
import korea from "../../images/korea.png";
import spain from "../../images/spain.png";
import rusia from "../../images/rusia.png";
import france from "../../images/france.png";
import { Navbar, NavDropdown, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import logo from "../../images/logo4.png"
const Navbarapp = () => {
  const { t, i18n } = useTranslation();
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const strAcc = address
    ? address.substring(0, 6) + '...' + address.substring(address.length - 4)
    : ''

  function handleClick(lang) {
    console.log("lang", lang);
    i18n.changeLanguage(lang);
  }

  const connectWallet = () => {
    connect({ connector: injected() })
  }

  return (
    <div className="fluid-container navbarmain">
      <div className="container">
        <Navbar collapseOnSelect expand="lg" className="" variant="dark">
          {/* <Container> */}
            <Link to="/">
              <Navbar.Brand
                href=""
                style={{ color: "white" }}
                className="navbarlogo"
              >
                <img src={logo} width="220px"/>
              </Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto ">
                <Link to="/swap" style={{ textDecoration: "none" }}>
                  {" "}
                  <Nav.Link href="#swap" className="ml-md-2 mx-1" id="navbartext">
                  {t('TheWell.1')}
                  </Nav.Link>
                </Link>
                <Link to="/facuet" style={{ textDecoration: "none" }}>
                  <Nav.Link href="#facuet" className=" mx-1" id="navbartext">
                  {t('THETAP.1')}
                  </Nav.Link>
                </Link>
                <Link to="/reservoir" style={{ textDecoration: "none" }}>
                  <Nav.Link href="#reservoir" className=" mx-1" id="navbartext">
                  {t('THESHORE.1')}
                  </Nav.Link>
                </Link>
              </Nav>
              <Nav className="me-3">
                <Nav.Link href="#deets" id="navbartext">
                {t('Whitepaper.1')}
                </Nav.Link>
                <Nav.Link
                  eventKey={5}
                  href="#memes"
                  id="navbartext"
                >
                   {t('SplashDAO.1')}
                </Nav.Link>
                <Nav.Link href="#Tutorial" id="navbartext">
                {t('Tutorial.1')}
                </Nav.Link>
                {/* <MdLanguage/> */}
                <NavDropdown title="Lang" id="collasible-nav-dropdown">
                  <NavDropdown.Item href="" onClick={() => handleClick("en")}>
                    <img src={uk} /> {t('English.1')}
                  </NavDropdown.Item>
                  <NavDropdown.Item  onClick={() => handleClick("chi")}>
                    <img src={china} />
                    {t('China.1')}
                  </NavDropdown.Item>
                  <NavDropdown.Item  onClick={() => handleClick("Ko")}>
                    <img src={korea} />
                    {t('Korea.1')}
                  </NavDropdown.Item>
                  <NavDropdown.Item  onClick={() => handleClick("sp")}>
                    <img src={spain} />
                    {t('Spain.1')}
                  </NavDropdown.Item>
                  <NavDropdown.Item  onClick={() => handleClick("ru")}>
                    <img src={rusia} />
                    {t('Rusia.1')}
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => handleClick("fr")}>
                    <img src={france} />
                    {t('France.1')}
                  </NavDropdown.Item>
                </NavDropdown>

                <div className="mx-2">
                  <button
                    className="btn btn-light"
                    onClick={isConnected ? () => disconnect() : connectWallet}
                  >
                    {isConnected ? strAcc : "Connect Wallet"}
                  </button>
                </div>
              </Nav>
            </Navbar.Collapse>
          {/* </Container> */}
        </Navbar>
        
      </div>
    </div>
  );
};

export default Navbarapp;
