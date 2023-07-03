import React, { useEffect, useState } from 'react';
import './App.css';

type Photo = {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
};

async function getFlickrImgs(keyword: string): Promise<any> {
  const searchApi = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=3e7cc266ae2b0e0d78e279ce8e361736&format=json&nojsoncallback=1&safe_search=1&text=${keyword}`;
  try {
    const searchRes = await fetch(searchApi);
    return searchRes.json();
  }
  catch (err) {
    console.log(err);
    return null;
  }

}

function App() {
  const [stateSearchStr, setStateSearchStr] = useState('');
  const [statePhotos, setStatePhotos] = useState<Photo[]>([]);
  const [statePage, setStatePage] = useState(1);

  const getImages = () => { };


  const searchImg = async (stateSearchStr: string) => {
    if (!stateSearchStr) {
      return;
    }




    const data = await getFlickrImgs(stateSearchStr);
    if (!data) {
      return;
    }

    const { stat, photos } = data;
    if (!stat && stat !== 'ok') {
      return;
    }

    const { page, pages, perpage, photo, total } = photos;

    setStatePhotos((prevPhotos) => [...prevPhotos, ...photo]);


  }

  const onScroll = () => {

  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, []);


  return (
    <div className="App">
      <input onChange={(event) => {
        setStateSearchStr(event.target.value);
      }} value={stateSearchStr} />
      <button onClick={() => {
        searchImg(stateSearchStr)
      }}>search</button>
      <div className='img-wrap'>
        {statePhotos.map((photo) => (
          <div className='img-item'>
            <img
              key={photo.id}
              src={`http://farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`}
              alt={photo.title}

            />
          </div>

        ))}

      </div>
    </div>
  );
}

export default App;
