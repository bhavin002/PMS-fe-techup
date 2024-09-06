import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeftCircleFill, ArrowRightCircleFill } from "react-bootstrap-icons";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerModal = ({ documentURL, show, setShow }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);

  const handleClose = () => setShow(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onError = (error) => {
    setError(error);
  };

  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>PDF Viewer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column align-items-center">
          {error && (
            <div className="alert alert-danger w-100" role="alert">
              Error: {error.message}
            </div>
          )}

          <Document
            file={documentURL}
            onLoadSuccess={onDocumentLoadSuccess}
            onError={onError}
          >
            <Page pageNumber={pageNumber} />
          </Document>

          {numPages && !error && (
            <div className="d-flex justify-content-between align-items-center w-100 mt-3">
              <Button
                variant="light"
                onClick={prevPage}
                disabled={pageNumber === 1}
              >
                <ArrowLeftCircleFill /> Prev
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="light"
                onClick={nextPage}
                disabled={pageNumber === numPages}
              >
                Next <ArrowRightCircleFill />
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PDFViewerModal;