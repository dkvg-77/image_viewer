import { Fragment, useState, useEffect } from "react";
import Modal from "react-modal";

function App() {
  Modal.setAppElement('body');

  const [file, setFile] = useState(null);
  const [imgList, setImageList] = useState([]);
  const [listUpdated, setListUpdated] = useState(false);
  const [viewedImage, setViewedImage] = useState(null);
  const [modalStatus, setModalStatus] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageDimensions, setImageDimensions] = useState({ width: "100px", height: "100px" });

  useEffect(() => {
    fetch('http://localhost:9000/images/get')
      .then(res => res.json())
      .then(res => setImageList(res))
      .catch(err => {
        console.error(err)
      })
    setListUpdated(false)
  }, [listUpdated])

  const selectedHandler = e => {
    setFile(e.target.files[0])
  }

  const sendHandler = () => {
    if (!file) {
      alert('Choose a file to upload')
      return
    }
    console.log(file);

    const formdata = new FormData()
    formdata.append('image', file)

    fetch('http://localhost:9000/images/post', {
      method: 'POST',

      body: formdata
    })
      .then(res => res.text())
      .then(res => {
        console.log(res)
        setListUpdated(true)
      })
      .catch(err => {
        console.error(err)
      })

    document.getElementById('fileInput').value = null

    setFile(null)
  }

  const modalHandler = (isOpen, image, index) => {
    setModalStatus(isOpen)
    setViewedImage(image)
    setImageIndex(index);
    setZoomLevel(1);
    setImageDimensions({ width: "auto", height: "auto" });
  }

  const deleteHandler = () => {
    let imgId = viewedImage.id

    fetch('http://localhost:9000/images/delete/' + imgId, {
      method: 'DELETE',
    })
      .then(res => res.text())
      .then(res => console.log(res))

    setModalStatus(false)
    setListUpdated(true)
  }

  const handleNextImage = () => {
    setImageIndex(prevIndex => (prevIndex + 1) % imgList.length);
    setViewedImage(imgList[(imageIndex + 1) % imgList.length]);
  };

  const handlePrevImage = () => {
    setImageIndex(prevIndex => (prevIndex === 0 ? imgList.length - 1 : prevIndex - 1));
    setViewedImage(imgList[(imageIndex === 0 ? imgList.length - 1 : imageIndex - 1)]);
  };

  const handleZoomIn = () => {
    setZoomLevel(prevZoom => 1.2*prevZoom );
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.1) {
      setZoomLevel(prevZoom => 0.8*prevZoom );
    }
  };

  useEffect(() => {
    const imageElement = document.getElementById("viewedImage");
    if (imageElement) {
      const scaledWidth = imageElement.naturalWidth * zoomLevel;
      const scaledHeight = imageElement.naturalHeight * zoomLevel;
      setImageDimensions({ width: `${scaledWidth}px`, height: `${scaledHeight}px` });
    }
  }, [zoomLevel, viewedImage]);

  return (
    <Fragment>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container" style={{justifyContent:"center"}}>
          <a href="#!" className="navbar-brand" style={{ fontSize: "28px" }}>Image viewer</a>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="card p-3">
          <div className="row">
            <div className="col-10">
              <input id="fileInput" onChange={selectedHandler} className="form-control" type="file" />
            </div>
            <div className="col-2">
              <button onClick={sendHandler} type="button" className="btn btn-primary col-12">Upload</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3" style={{ display: "flex", flexWrap: "wrap" }}>
        {imgList.map((image, index) => (
          <div key={image.id} className="card m-2">
            <img src={`data:image/png;base64, ${image.data}`} alt="..." className="card-img-top" style={{ height: "160px", width: "260px" }} />
            <div className="card-body text-center">
              <button onClick={() => modalHandler(true, image, index)} className="btn btn-dark">View</button>
            </div>
          </div>
        ))}
      </div>

      <Modal style={{ content: { right: "20%", left: "20%", overflow:"hidden" }}} isOpen={modalStatus} onRequestClose={() => modalHandler(false, null)}>
        <div className="card" style={{ height: "63vh",
        justifyContent:"center",alignItems:"center",  overflowY: "auto" }}>
          {viewedImage && < img src={`data:image/png;base64, ${viewedImage.data}`} alt="..." id="viewedImage" style={{ width: imageDimensions.width, height: imageDimensions.height }} />}
          
        </div>
        <div className="text-center py-2">
          <h2>
            {`${imageIndex + 1}/${imgList.length}`}
          </h2>
          
          </div>
        <div className="card-body text-center">
          <button onClick={deleteHandler} className="btn btn-danger mx-3">Delete</button>
          <button onClick={handlePrevImage} className="btn btn-secondary mx-3">Previous</button>
          <button onClick={handleNextImage} className="btn btn-secondary mx-3">Next</button>
          <button onClick={handleZoomIn} className="btn btn-secondary mx-3">Zoom In</button>
          <button onClick={handleZoomOut} className="btn btn-secondary mx-3">Zoom Out</button>
          <button className="btn btn-secondary" onClick={() => window.open(`http://localhost:9000/${viewedImage}`, '_blank')}>Full Screen</button>
        </div>
      </Modal>
    </Fragment>
  );
}

export default App;
