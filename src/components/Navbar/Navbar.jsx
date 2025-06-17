import React, { useState, useEffect } from "react";
import "./navbar.css";
import { Link } from "react-router-dom";
// import { Modal, ModalHeader, ModalBody } from "reactstrap";
// import metamask from "../../images/metamask.png";
// import wallet from "../../images/wallet-connect.jfif";
// import logo from "../../images/logo.png";
// import language from "../../images/language.png";
// import { MdLanguage } from "react-icons/md";
// import japan from "../../images/japan.png";
// import { useWeb3React } from "@web3-react/core";
// import useAuth from "../../hooks/useAuth";
import uk from "../../images/uk.png";
import china from "../../images/china.png";
import korea from "../../images/korea.png";
import spain from "../../images/spain.png";
import rusia from "../../images/rusia.png";
import france from "../../images/france.png";
import { Navbar, NavDropdown, Nav, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {loadWeb3} from '../api'
import logo from "../../images/logo4.png"
const Navbarapp = () => {
  const { t, i18n } = useTranslation();
  // const { account } = useWeb3React();
  // const { login, logout } = useAuth();
  // const [show, setshow] = useState(false);
let [account, setAccount]=useState();
let [strAcc, setStrAcc]=useState()
  function handleClick(lang) {
    console.log("lang", lang);
    i18n.changeLanguage(lang);
  }

const connectWallet = async()=>{
  try{
let acc= await loadWeb3();
setAccount(acc);
let ac= acc? acc.substring(0, 6) + "..." + acc.substring(acc.length - 6):
setStrAcc(ac);
console.log(acc);
  }catch(error){
    console.log("while connecting",error )
  }
}
useEffect(() => {
setInterval(()=>{
connectWallet();
},1000)
}, [])
  // const connectWallet = () => {
  //   if (show) {
  //     setshow(false);
  //     logout();
  //   } else {
  //     setshow(true);
  //   }
  // };

  // console.log("account", account);
  // const connectMetaMask = () => {
  //   localStorage.setItem("injected", "injected");
  //   login("injected");
  //   localStorage.setItem("flag", "true");
  //   setshow(false);
  // };
  // const walletConnect = async () => {
  //   localStorage.setItem("walletconnect", "walletconnect");
  //   login("walletconnect");
  //   setshow(false);
  // };

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
                  <button className="btn btn-light" >
                    <g data-v-de8c4aa0>
                      <path d="M6 0a.5.5 0 0 1 .5.5V3h3V.5a.5.5 0 0 1 1 0V3h1a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 8.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.083 2.083 0 0 1-.97 1.028C6.725 13.9 6.169 14 5.5 14c-.998 0-1.61.33-1.974.718A1.922 1.922 0 0 0 3 16H2c0-.616.232-1.367.797-1.968C3.374 13.42 4.261 13 5.5 13c.581 0 .962-.088 1.218-.219.241-.123.4-.3.514-.55.121-.266.193-.621.23-1.09.027-.34.035-.718.037-1.141A3.5 3.5 0 0 1 4 6.5v-3a.5.5 0 0 1 .5-.5h1V.5A.5.5 0 0 1 6 0zM5 4v2.5A2.5 2.5 0 0 0 7.5 9h1A2.5 2.5 0 0 0 11 6.5V4H5z"></path>
                    </g>
                    {/* Connect Wallet */}
                    {account ? "Connected" : "Connect Wallet"}
                  </button>
                </div>
              </Nav>
            </Navbar.Collapse>
          {/* </Container> */}
        </Navbar>
        {/* <Modal isOpen={show} className="sc-fujyUd chnMFN web3modal-modal-card" size="md"
        aria-labelledby="contained-modal-title-vcenter" centered>
        <ModalHeader >
          <button type="button" className="close mr-auto" data-dismiss="modal" onClick={() => setshow(false)} aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </ModalHeader>
        <ModalBody className="modal-body sc-eCApGN cjAFRf web3modal-provider-wrapper">
          <div className="container main-divs">
            <div className="metamask_main">
              <button type="button" onClick={connectMetaMask} className="metamask_btn">
                <div>
                  <img src={metamask} alt="" className="connect_img" />
                </div>
                <h3 className="metamask_heading">{t('MetaMask.1')}</h3>
                <p className="modal_text">{t('ConnecttoyourMetaMaskWallet.1')}</p>
              </button>
            </div>
            <div className="metamask_main">
              <button type="button" onClick={walletConnect} className="metamask_btn">
                <div className="scan-wallet" >
                  <img src={wallet} alt="WalletConnect" className="connect_img" />
                  <h3 className="metamask_heading">{t('WalletConnect.1')}</h3>
                  <p className="modal_text">{t('ScanwithWalletConnecttoconnect.1')}</p>
                </div>
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal> */}
        
      </div>
    </div>
  );
};

export default Navbarapp;
