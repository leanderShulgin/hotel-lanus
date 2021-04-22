import React, { useState } from "react";
import { useHistory } from "react-router-dom";

// Firebase
import firebaseApp from "../firebaseApp";

// Components
import NavigationBar from "./NavigationBar";

// React Bootstrap Components
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const AdminPanel = () => {
  return (
    <React.Fragment>
      <NavigationBar />
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6">
          <h1 className="text-center">Admin Panel</h1>
          <RoomEditor />
        </div>
        <div className="col-md-3"></div>
      </div>
    </React.Fragment>
  );
};

const RoomEditor = () => {
  const history = useHistory();
  //Firebase
  const db = firebaseApp.firestore();
  const storage = firebaseApp.storage();
  // State
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [roomType, setRoomType] = useState("shared");
  const [singleBeds, setSingleBeds] = useState(0);
  const [doubleBeds, setDoubleBeds] = useState(0);
  const [gender, setGender] = useState("mixed");
  const [imageAsFile, setImageAsFile] = useState("");
  const [errorMsgs, setErrorMsgs] = useState([]);

  const validateFields = () => {
    let dataIsValid = true;
    let errors = [];
    if (name === "") {
      errors.push({
        field: "name",
        error: "Debes asignarle un nombre a la habitación",
      });
      dataIsValid = false;
    }
    if (shortDescription === "") {
      errors.push({
        field: "shortDescription",
        error: "Debes dar una descripción de la habitación",
      });
      dataIsValid = false;
    }
    if (singleBeds === 0 && doubleBeds === 0) {
      errors.push({
        field: "beds",
        error: "La habitación debe contar con al menos una cama",
      });
      dataIsValid = false;
    }
    // if (mainImgUrl === "") {
    //   errors.push({
    //     field: "mainImgUrl",
    //     error: "La habitación debe contar con una foto",
    //   });
    //   dataIsValid = false;
    // }
    return { dataIsValid, errors };
  };

  const handleSubmit = async () => {
    const { dataIsValid, errors } = validateFields();

    if (dataIsValid) {
      let data = {
        name,
        shortDescription,
        longDescription: "",
        roomType,
        singleBeds,
        doubleBeds,
        gender,
        mainImgUrl: "",
        imgUrls: [],
        amenities: {
          airConditioner: false,
          privateBathroom: false,
          breakfastIncluded: false,
          lateCheckIn: false,
          lateCheckOut: false,
          sheetsIncluded: false,
          wifi: false,
          smoker: false,
          tv: false,
        }
      };
      try {
        // Guardo la imagen principal
        await storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile);
        const mainImgUrl = await storage
          .ref("images")
          .child(imageAsFile.name)
          .getDownloadURL();
          // Guardo la habitación
        data = { ...data, mainImgUrl };
        await db.collection("rooms").add(data);
        console.log("se ha creado una habitacion", data);

        history.push("./rooms");
      } catch (error) {
        console.log("Ha ocurrido un error al crear la habitacion", error);
      }
    } else {
      console.log("Data contains errors");
      setErrorMsgs(errors);
      window.scrollTo(0, 0);
      return;
    }
  };
  return (
    <Form className="form">
      <h2 className="text-center">Nueva Habitación</h2>
      {errorMsgs.map((msg) => {
        return (
          <Alert key={msg.field} variant="danger">
            {msg.error}
          </Alert>
        );
      })}
      <Form.Group>
        <Form.Label>Nombre</Form.Label>
        <Form.Text className="text-muted">
          Dale un nombre a la habitación
        </Form.Text>
        <Form.Control
          value={name}
          type="text"
          placeholder="Ej: Habitación Estándar"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Tipo de habitación</Form.Label>
        <Form.Control
          as="select"
          value={roomType}
          onChange={(e) => {
            if (e.target.value === "private") {
              setGender("mixed");
            }
            setRoomType(e.target.value);
          }}
        >
          <option value="shared">Compartida</option>
          <option value="private">Privada</option>
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Label>Género</Form.Label>
        <Form.Control
          as="select"
          value={gender}
          disabled={roomType === "private"}
          className={roomType === "private" && "text-muted"}
          onChange={(e) => {
            setGender(e.target.value);
          }}
        >
          <option value="mixed">Mixta</option>
          <option value="female">Dormi Femenino</option>
          <option value="male">Dormi Masculino</option>
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Label>Camas</Form.Label>
        <div className="row">
          <div className="col-6">
            <Form.Text>Individuales</Form.Text>
            <Form.Control
              type="number"
              value={singleBeds}
              onChange={(e) => {
                setSingleBeds(
                  parseInt(e.target.value >= 0 ? e.target.value : 0)
                );
              }}
            />
          </div>
          <div className="col-6">
            <Form.Text>Matrimoniales</Form.Text>
            <Form.Control
              type="number"
              value={doubleBeds}
              onChange={(e) => {
                setDoubleBeds(
                  parseInt(e.target.value >= 0 ? e.target.value : 0)
                );
              }}
            />
          </div>
        </div>
      </Form.Group>

      <Form.Group>
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          type="text"
          as="textarea"
          value={shortDescription}
          rows={4}
          placeholder="Describe la habitación"
          onChange={(e) => {
            setShortDescription(e.target.value);
          }}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Foto de portada</Form.Label>
        <Form.File
          onChange={(e) => {
            const imgFile = e.target.files[0];
            console.log("cargando imagen", imgFile);
            setImageAsFile(imgFile);
          }}
        />
      </Form.Group>
      <Button
        block
        variant="primary"
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        Guardar
      </Button>
    </Form>
  );
};

export default AdminPanel;
