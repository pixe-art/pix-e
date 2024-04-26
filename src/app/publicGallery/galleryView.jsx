import { useState } from 'react';
import Link  from 'next/link'; 
import { BsThreeDots } from 'react-icons/bs';
import { Dropdown } from 'react-bootstrap';
import { downloadImage } from './galleryPresenter.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as outlineHeart } from '@fortawesome/free-regular-svg-icons';

export default function GalleryView(props) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-cream transition ease transform duration-300`;

    return (
        <div className="min-h-screen bg-cream flex text-black">
            <div 
                className={`transition-all duration-300 ${isMenuOpen ? 'w-64' : 'w-16'} bg-brown text-white p-4 flex flex-col`}
                onMouseLeave={() => setMenuOpen(false)}
            >
                <div className="flex items-center mb-4">
                <button
                    className="flex flex-col h-10 w-12 border-2 border-cream rounded justify-center items-center group"
                    onMouseEnter={() => setMenuOpen(true)}
                    onClick={() => setMenuOpen(!isMenuOpen)} 
                >
                    <div
                        className={`${genericHamburgerLine} ${
                            isMenuOpen
                                ? "rotate-45 translate-y-3 opacity-50 group-hover:opacity-100"
                                : "opacity-50 group-hover:opacity-100"
                        }`}
                    />
                    <div className={`${genericHamburgerLine} ${isMenuOpen ? "opacity-0" : "opacity-50 group-hover:opacity-100"}`} />
                    <div
                        className={`${genericHamburgerLine} ${
                            isMenuOpen
                                ? "-rotate-45 -translate-y-3 opacity-50 group-hover:opacity-100"
                                : "opacity-50 group-hover:opacity-100"
                        }`}
                    />
                </button>
                    {isMenuOpen && <h1 className="text-2xl ml-4">Menu</h1>}
                </div>
                {isMenuOpen && (
                    <>
                        {/* Add menu items here */}
                        <Link href="/dashboard" className="text-white no-underline hover:underline">Dashboard</Link>
                        <Link href="/privateGallery" className="text-white no-underline hover:underline">My Gallery</Link>
                        <Link href="#" className="text-white no-underline hover:underline">Public Gallery</Link>
                        <Link href="/art-tool" className="text-white no-underline hover:underline">Create a picture</Link>
                    </>
                )}
            </div>
            <div className="flex-grow p-4">
                <h1 className="text-2xl mb-2">Gallery</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {props.model.pictures.map((image) => {
                    const [isDropdownOpen, setDropdownOpen] = useState(false);
                    const [isFavourite, setFavourite] = useState(false);
                    const [animate, setAnimate] = useState(false);
                    const toggleFavourite = () => {
                        setFavourite(!isFavourite);
                        if (!isFavourite) {
                          setAnimate(true);
                          setTimeout(() => setAnimate(false), 500); 
                        }
                      };

                    return (
                        <div key={image.id} className="relative rounded shadow-lg p-4 bg-cream transform transition duration-500 hover:scale-110 hover:z-10">
                            <img src={image.testPicture} alt="" className="w-full h-auto object-cover" />
                            <Dropdown className="absolute bottom-0 right-0 mb-2 mr-2" onClick={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                                <Dropdown.Toggle variant="none" id="dropdown-basic">
                                    <BsThreeDots />
                                </Dropdown.Toggle>
                                {isDropdownOpen && (
                                <Dropdown.Menu className="bg-cream text-black rounded-md shadow-lg text-sm flex flex-col p-2">
                                    <Dropdown.Item className={`hover:bg-gray-400 hover:text-white hover:rounded-md flex items-center p-1 ${isFavourite ? 'text-red-500' : ''}`} onClick={toggleFavourite}>
                                        <FontAwesomeIcon icon={isFavourite ? solidHeart : outlineHeart} className={`mr-2 ${isFavourite ? 'animate-pulse' : ''}`} />
                                        Favourite
                                    </Dropdown.Item>
                                    <Dropdown.Item className="hover:bg-gray-400 hover:text-white hover:rounded-md flex items-center p-1" onClick={() => downloadImage(image.storage, image.title)}>
                                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                        Download
                                    </Dropdown.Item>
                                    <Dropdown.Item className="hover:bg-gray-400 hover:text-white hover:rounded-md p-1" href="#/">
                                        <FontAwesomeIcon icon={faQuestion} className="mr-2" />
                                        Something
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                                )} 
                            </Dropdown>
                            <div className="px-6 py-4"> 
                                <div className="font-bold text-lg mb-2">{image.title}</div>
                                <p className="text-gray-700 text-base">
                                    Created by: {image.creator}
                                </p>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}