import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../components/Image.jsx";

export default function IndexPage() {
  const [places, setPlaces] = useState([
    {
      _id: "671371126cdc623809609b39",
      owner: 15354851,
      title: "this is a good place",
      address: "this is an address",
      photos: [],
      description: "this is description",
      perks: [],
      extraInfo: "extra info",
      checkIn: 1234567890,
      checkOut: 1234567890,
      maxGuests: 3,
      price: 100,
    },
  ]);
  useEffect(() => {
    try {
      axios.get("/places").then((response) => {
        setPlaces(response.data);
      });
    } catch (e) {
      alert("error fetching places");
      console.log("error fetching places (in IndexPage.jsx):", e.message);
    }
  }, []);
  return (
    <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {places.length > 0 &&
        places.map((place) => (
          <Link to={"/place/" + place._id} key={place._id}>
            <div className="bg-gray-500 mb-2 rounded-2xl flex">
              {place.photos?.[0] && (
                <Image
                  className="rounded-2xl object-cover aspect-square"
                  src={place.photos?.[0]}
                  alt=""
                />
              )}
            </div>
            <h2 className="font-bold">{place.address}</h2>
            <h3 className="text-sm text-gray-500">{place.title}</h3>
            <div className="mt-1">
              <span className="font-bold">${place.price}</span> per night
            </div>
          </Link>
        ))}
    </div>
  );
}
