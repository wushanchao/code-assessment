import React, { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
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

interface SearchApiResponse {
  stat: string;
  photos: {
    page: number;
    pages: number;
    perpage: number;
    photo: Photo[];
    total: number;
  };
}

async function getFlickrImgs(keyword: string): Promise<SearchApiResponse | null> {
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

async function getNextFlickrImgs(keyword: string, pageNum: number): Promise<SearchApiResponse | null> {
  const searchApi = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=3e7cc266ae2b0e0d78e279ce8e361736&format=json&nojsoncallback=1&safe_search=1&text=${keyword}&page=${pageNum}`;
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
  const pageRef = useRef(1);
  const searchStrRef = useRef('');
  const loadingRef = useRef(false);

  const searchImg = async (stateSearchStr: string) => {
    if (!stateSearchStr) {
      return;
    }

    setStatePhotos([]);
    pageRef.current = 1;


    const data = await getFlickrImgs(stateSearchStr);
    if (!data) {
      return;
    }

    const { stat, photos } = data;
    if (!stat && stat !== 'ok') {
      console.log('response err');
      return;
    }

    const { photo } = photos;

    setStatePhotos((prevPhotos) => [...prevPhotos, ...photo]);

  }

  const getNextPageImg = async (nextPage: number) => {

    loadingRef.current = true;
    const data = await getNextFlickrImgs(searchStrRef.current, nextPage);
    loadingRef.current = false;
    if (!data) {
      return;
    }

    const { stat, photos } = data;
    if (!stat && stat !== 'ok') {
      return;
    }

    const { photo } = photos;
    setStatePhotos((prevPhotos) => [...prevPhotos, ...photo]);
  }

  useEffect(() => {
    const loadMore = () => {
      console.log('loadMore');

      if (loadingRef.current) {
        console.log('loading...');
        return;
      }
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      getNextPageImg(nextPage);
    };

    const onScroll = () => {
      console.log('scrollHeight', document.documentElement.scrollHeight);
      console.log('innerHeight+scrollTop', window.innerHeight + document.documentElement.scrollTop);
      if (Math.ceil(window.innerHeight + document.documentElement.scrollTop) >= (document.documentElement.scrollHeight)) {
        loadMore();
      }
    };

    const onScrollThrottle = throttle(onScroll, 1000);

    window.addEventListener('scroll', onScrollThrottle);

    return () => {
      window.removeEventListener('scroll', onScrollThrottle);
    }
  }, []);


  useEffect(() => {
    searchStrRef.current = stateSearchStr;
  }, [stateSearchStr]);



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
          <div key={photo.id} className='img-item'>
            <img
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
