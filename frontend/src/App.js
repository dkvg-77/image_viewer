import { Fragment, useState, useEffect } from "react";
import Modal from "react-modal";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

function App() {
  Modal.setAppElement('body');

  const isDesktop = window.innerWidth > 768;

  const [file, setFile] = useState(null);
  const [imgList, setImageList] = useState([]);
  const [listUpdated, setListUpdated] = useState(false);
  const [viewedImage, setViewedImage] = useState(null);
  const [modalStatus, setModalStatus] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageDimensions, setImageDimensions] = useState({ width: "100px", height: "100px" });

  // Fetching of images present in the database initially.

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/images/get`)
      .then(res => res.json())
      .then(res => setImageList(res))
      .catch(err => {
        console.error(err)
      })
    setListUpdated(false)
  }, [listUpdated])

  // Uploading an image.

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

    fetch(`${process.env.REACT_APP_BACKEND_URL}/images/post`, {
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

  // Modalhandler to handle the states when we press the view button.

  const modalHandler = (isOpen, image, index) => {
    setModalStatus(isOpen)
    setViewedImage(image)
    setImageIndex(index);
    setZoomLevel(1);
    setImageDimensions({ width: "auto", height: "auto" });
  }


  // Deletehandler to delete an image.

  const deleteHandler = () => {
    let imgId = viewedImage.id

    fetch(`${process.env.REACT_APP_BACKEND_URL}/images/delete/` + imgId, {
      method: 'DELETE',
    })
      .then(res => res.text())
      .then(res => console.log(res))

    setModalStatus(false)
    setListUpdated(true)
  }


  // Handling the remaining features.

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
    if (zoomLevel > 0.01) {
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

      <div className="container my-3 my-sm-4">
        <div className="card p-3">
          <div className="row">
            <div className="col-lg-10 col-md-9 col-sm-8">
              <input id="fileInput" onChange={selectedHandler} className="form-control" type="file" />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4 mt-3 mt-sm-0">
              <button onClick={sendHandler} type="button" className="btn btn-primary col-12">Upload</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
          {imgList.map((image, index) => (
            <div key={image.id} className="col mb-4">
              <div className="card align-items-center">
                <img src={`data:image/png;base64, ${image.data}`} alt="..." className="card-img-top" style={{ height: "160px"}} />
                <div className="card-body text-center">
                  <button onClick={() => modalHandler(true, image, index)} className="btn btn-dark">View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal style={{
        content: {
          overflow: 'hidden',
          top: isDesktop ? '40px' : '50px',
          bottom: isDesktop ? '40px' : '50px',
          left: isDesktop ? '20%' : '10%',
          right: isDesktop ? '20%' : '10%',
        }
      }}isOpen={modalStatus} onRequestClose={() => modalHandler(false, null)}>
        <div className="card" style={{
          height: "59vh",
          justifyContent: "center", alignItems: "center", overflowY: "auto"
        }}>
          {viewedImage && < img src={`data:image/png;base64, ${viewedImage.data}`} alt="..." id="viewedImage" style={{ width: imageDimensions.width, height: imageDimensions.height }} />}

        </div>
        <div className="text-center py-2">
          <h2>
            {`${imageIndex + 1}/${imgList.length}`}
          </h2>
        </div>


        <div className="card-body text-center d-flex justify-content-center">
          <div className="d-flex flex-column align-items-center mx-1 mx-sm-3">
            <button onClick={deleteHandler} className="btn btn-danger mx-sm-3">
              <i className="icon size fa fa-trash" aria-hidden="true"></i>
            </button>
            <span className='icon-names'>Delete</span>
          </div>

          <div className="d-flex flex-column align-items-center mx-1 mx-sm-3">
            <button onClick={handlePrevImage} className="btn btn-secondary mx-sm-3">
              <i className="icon size fa fa-arrow-left" aria-hidden="true"></i>
            </button>
            <span className='icon-names'>Previous</span>
          </div>

          <div className="d-flex flex-column align-items-center mx-1 mx-sm-3">
            <button onClick={handleNextImage} className="btn btn-secondary mx-sm-3">
              <i className="icon size fa fa-arrow-right" aria-hidden="true"></i>
            </button>
            <span className='icon-names'>Next</span>
          </div>
          
          <div className="d-flex flex-column align-items-center mx-1 mx-sm-3">
            <button onClick={handleZoomOut} className="btn btn-secondary mx-sm-3">
              <i className="icon size fa fa-search-minus" aria-hidden="true"></i>
            </button>
            <span className='icon-names'>Zoom Out</span>
          </div>

          <div className="d-flex flex-column align-items-center mx-1 mx-sm-3">
            <button onClick={handleZoomIn} className="btn btn-secondary mx-sm-3">
              <i className="icon size fa fa-search-plus" aria-hidden="true"></i>
            </button>
            <span className='icon-names'>Zoom In</span>
          </div>

          <div className="d-flex flex-column align-items-center mx-1 mx-sm-3">
            <button className="btn btn-secondary" >
              <i className="icon size fa fa-expand" aria-hidden="true"></i>
            </button>
            <span className='icon-names'>Full Screen</span>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
}

export default App;
