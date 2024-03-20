import React, { Component, createRef } from "react";
import { withTranslation } from "react-i18next";
import Lightbox from "react-image-lightbox";
import "./Gallery.scss";
import "react-image-lightbox/style.css";

class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPicture: this.props.pictures ? this.props.pictures[0] : null,
      currentPictureIndex: 0,
      lightboxOpened: false,
    };
    this.thumbnailRef = createRef();
    this.selectedPictureRef = createRef();
  }

  next() {
    this.selectImage(this.state.currentPictureIndex + 1);
  }

  previous() {
    this.selectImage(this.state.currentPictureIndex - 1);
  }

  selectImage(i) {
    const img = this.props.pictures[i];
    if (img) {
      this.setState({
        currentPicture: img,
        currentPictureIndex: i,
      });
      this.onImageChange(i);
    }
  }

  onImageChange(index) {
    if (this.props.showThumbnails) {
      this.thumbnailRef.current.scrollLeft =
        index *
          (this.selectedPictureRef.current.offsetWidth +
            this.selectedPictureRef.current.offsetWidth / 10) -
        this.thumbnailRef.current.offsetWidth / 2 +
        this.selectedPictureRef.current.offsetWidth / 2;
    }
  }

  onImageClick() {
    if (this.props.withLightbox) {
      this.setState({ lightboxOpened: true });
    }
  }

  render() {
    return (
      <div className="gallery">
        {this.state.lightboxOpened && (
          <Lightbox
            mainSrc={
              this.props.pictures[this.state.currentPictureIndex].original
            }
            nextSrc={
              this.props.pictures[
                (this.state.currentPictureIndex + 1) %
                  this.props.pictures.length
              ].original
            }
            prevSrc={
              this.props.pictures[
                (this.state.currentPictureIndex +
                  this.props.pictures.length -
                  1) %
                  this.props.pictures.length
              ].original
            }
            onCloseRequest={() => this.setState({ lightboxOpened: false })}
            onMovePrevRequest={() => this.previous()}
            onMoveNextRequest={() => this.next()}
            imageCaption={this.props.pictures[this.state.currentPictureIndex].caption}
          />
        )}
        <a href={this.props.imageLink}>
          <div
            className={
              "gallery-preview" +
              (!this.props.showThumbnails ? " full-height" : "") +
              (this.props.coverPicture ? " cover-picture" : "") +
              (this.props.withLightbox ? " with-lightbox" : "")
            }
          >
            {this.props.pictures?.map((picture, i) =>
              i >= this.state.currentPictureIndex - 1 &&
              i <= this.state.currentPictureIndex + 1 ? (
                <div
                  onClick={this.onImageClick.bind(this)}
                  key={picture._id}
                  className={
                    "picture" +
                    (this.state.currentPictureIndex === i ? " selected" : "")
                  }
                  style={{
                    backgroundImage: `url(${picture.original})`,
                    right: (this.state.currentPictureIndex - i) * 100 + "%",
                    left: (i - this.state.currentPictureIndex) * 100 + "%",
                  }}
                ></div>
              ) : null
            )}
          </div>
        </a>
        {this.props.showArrows && (
          <>
            <div
              className={
                "arrow left-arrow-container" +
                (this.props.showThumbnails ? " with-thumbnails" : "") +
                (this.props.transparentArrows ? " transparent-arrows" : "")
              }
              onClick={this.previous.bind(this)}
            >
              <i className="ico ico-left" />
            </div>
            <div
              className={
                "arrow right-arrow-container" +
                (this.props.showThumbnails ? " with-thumbnails" : "") +
                (this.props.transparentArrows ? " transparent-arrows" : "")
              }
              onClick={this.next.bind(this)}
            >
              <i className="ico ico-right" />
            </div>
          </>
        )}
        {this.props.showDots && (
          <div className="dots">
            {this.props.pictures?.map((picture, i) => (
              <div
                key={picture._id}
                className={
                  "dot" +
                  (this.state.currentPictureIndex === i ? " selected" : "")
                }
                onClick={this.selectImage.bind(this, i)}
              ></div>
            ))}
          </div>
        )}
        {this.props.showThumbnails && (
          <div className="thumbnails" ref={this.thumbnailRef}>
            <div className="thumbnails-container">
              {this.props.pictures?.map((picture, i) => (
                <div
                  key={picture._id}
                  ref={
                    this.state.currentPictureIndex === i
                      ? this.selectedPictureRef
                      : null
                  }
                  className={
                    "picture" +
                    (this.state.currentPictureIndex === i ? " selected" : "")
                  }
                  style={{
                    backgroundImage: `url(${picture.thumbnail})`,
                  }}
                  onClick={this.selectImage.bind(this, i)}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation("gallery")(Gallery);
