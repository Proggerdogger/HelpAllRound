import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

// Header component (Specific to this page, leave this one)
const Header_BookPage = () => {
  return (
    <header className="absolute top-0 right-0 left-0 flex items-center justify-center p-6">
      {/* Logo centered */}
      <div className="text-4xl font-bold text-red-600 mx-auto">HelpAllRound</div>
    </header>
  );
};

export default function StartBookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header_BookPage />
      <main className="flex flex-col lg:flex-row items-start px-4 pt-24 pb-12 max-w-6xl mx-auto">
        {/* Left: Booking/Phone Options */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start mb-12 lg:mb-0 lg:translate-x-[30%]">
          <div className="flex flex-col items-center lg:items-start space-y-6">
            {/* Start Booking Button */}
            <Link href="/book/login">
              <button className="w-64 bg-red-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-red-700 transition text-center cursor-pointer">
                Start Booking
              </button>
            </Link>

            {/* Instruction Text */}
            <p className="text-sm text-gray-800 w-64 leading-relaxed">
              Skip the phone queue! To proceed, you will need a credit card and a mobile phone number.
            </p>

            {/* Call Us On Rectangle */}
            <a href="tel:1300396316" className="w-64 bg-black text-white flex items-center justify-center space-x-3 py-4 px-6 rounded-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  strokeWidth="1.5"
                  d="M23.3,25.5c-3.4,0-7.1-1.8-10.5-5.1c-2.6-2.5-5.6-6.5-5.2-11.1C7.7,8,9.2,6.1,10.9,5.7c1.9-0.5,3,0.8,3.4,1.3
                  c0.5,0.6,1.8,2.3,2.3,3.2c0.6,1.1,0.3,2.6-0.6,3.4c-0.2,0.2-0.3,0.5-0.3,0.8c0,0.3,0.1,0.5,0.3,0.7c0.8,0.7,1.1,1,1.2,1.1l1.1,1.1
                  c0.6,0.6,1.4,0.2,1.6,0c0.9-0.9,2.3-1.2,3.5-0.6c0.9,0.4,2.7,1.7,3.3,2.2c1.2,1,1.7,2.1,1.3,3.3c-0.5,1.6-2.5,3.2-3.8,3.3
                  C23.9,25.5,23.6,25.5,23.3,25.5z"
                />
              </svg>
              <span className="text-sm">Call us on 1300 396 316</span>
            </a>

            {/* Additional Instruction Text */}
            <p className="text-sm text-gray-800 w-64">
              For any questions, or to book via phone.
            </p>

          
          </div>
        </div>

        {/* Right: Large Image */}
        <div className="lg:w-1/2 flex justify-center">
          <Image
            src="/images/Car_ride.png"
            alt="Help All Round Placeholder"
            width={500}
            height={350}
            className="object-contain rounded-lg"
            priority
          />
        </div>
      </main>

      {/* Why HelpAllRound Section */}
      <section className="py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Why HelpAllRound?
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-start gap-8">
          {/* Same Day Service */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="svg1"
                viewBox="0 0 88.621 84.407"
                version="1.1"
                className="w-8 h-8"
              >
                <defs id="defs3">
                  <radialGradient
                    id="radialGradient915"
                    gradientUnits="userSpaceOnUse"
                    cy="42.721"
                    cx="44.7"
                    gradientTransform="scale(1.0225 .97802)"
                    r="12.239"
                  >
                    <stop
                      id="stop913"
                      className={styles["fill-white"]}
                      offset="0"
                    />
                    <stop
                      id="stop914"
                      className={styles["fill-white-opacity-0"]}
                      offset="1"
                    />
                  </radialGradient>
                </defs>
                <g
                  id="g916"
                  transform="translate(-6.3869 -4.2638)"
                >
                  <path
                    id="path910"
                    className={`${styles["stroke-linejoin-round"]} ${styles["fill-rule-evenodd"]} ${styles["stroke-width-1_3084"]} ${styles["fill-opacity-98077"]} ${styles["fill-ffbb00"]}`}
                    transform="matrix(.96493 0 0 .94588 4.5275 -.75584)"
                    d="m68.563 51.18c0 11.889-9.649 21.538-21.538 21.538s-21.538-9.649-21.538-21.538 9.649-21.538 21.538-21.538 21.538 9.649 21.538 21.538z"
                  />
                  <path
                    id="path854"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m47.529 16.162c-1.631 3.452 2.325 8.671 5.419 4.753 1.193-3.41 0.346-7.149 0.749-10.695 0.791-3.0987-0.442-5.5867-3.88-5.9562-1.99 0.3901-1.724 7.8582-2.288 11.898z"
                  />
                  <path
                    id="path855"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m25.351 9.628c-1.173 0.037-2.219 0.739-2.678 1.798-0.46 1.06-0.25 2.284 0.537 3.138 0 0 2.45 2.713 10.072 11.203 0.694 0.849 1.809 1.256 2.901 1.058s1.984-0.968 2.323-2.004c0.339-1.037 0.07-2.172-0.701-2.956-7.619-8.487-10.041-11.202-10.041-11.202-0.6-0.6893-1.489-1.0706-2.413-1.035z"
                  />
                  <path
                    id="path870"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m10.606 24.851c-0.312 1.094-0.7464 2.9 1.058 3.595 4.149 2.767 8.959 3.979 14.045 6.04 1.956 0.767 4.209-1.007 3.993-3.029-0.092-1.92-2.154-2.717-3.732-3.255-3.962-1.616-8.02-2.995-12.063-4.403-1.196-0.12-2.325 0.437-3.301 1.052z"
                  />
                  <path
                    id="path873"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m6.4752 46.865c0.1294 1.377-0.6018 2.966 0.7108 3.773 2.7443 0.897 9.268 0.865 14.202 0.914 2.391-0.185 3.556-3.508 1.713-5.053-1.418-1.321-3.48-0.727-5.228-0.912-2.051-0.045-11.84-0.375-11.398 1.278z"
                  />
                  <path
                    id="path858"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m25.11 56.834c-0.474 0.011-0.939 0.133-1.357 0.354-5.704 2.881-8.627 4.323-10.101 5.025-0.688 0.327-1.014 0.462-1.176 0.532-0.012 0.005-0.081 0.026-0.091 0.03-1.417 0.457-2.28 1.86-2.031 3.301 0.249 1.442 1.535 2.489 3.026 2.463 0 0 0.396-0.009 0.513-0.03 0.116-0.02 0.207-0.042 0.271-0.059 0.129-0.034 0.204-0.065 0.272-0.089 0.134-0.047 0.221-0.087 0.361-0.147 0.281-0.12 0.7-0.31 1.478-0.68 1.556-0.741 4.526-2.193 10.252-5.084 1.284-0.608 1.958-2.015 1.616-3.372s-1.608-2.293-3.033-2.244z"
                  />
                  <path
                    id="path859"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m33.734 68.036c-0.774 0.027-1.508 0.344-2.05 0.887-5.184 5.082-7.8 7.55-9.047 8.69-0.485 0.445-0.601 0.548-0.723 0.651-0.005 0.004-0.026 0.025-0.030 0.029-0.925 0.538-1.488 1.518-1.478 2.572l0.121 0.887 0.693 1.123 1.176 0.768c0.001 0.001 1.025 0.178 1.025 0.178 0.001 0 0.472-0.026 0.634-0.059 0.161-0.034 0.261-0.083 0.362-0.119 0.202-0.07 0.325-0.126 0.422-0.177 0.388-0.203 0.458-0.271 0.603-0.384 0.29-0.228 0.651-0.535 1.327-1.153 1.351-1.236 3.959-3.704 9.166-8.809 0.901-0.849 1.174-2.156 0.685-3.284-0.488-1.129-1.636-1.844-2.886-1.8z"
                  />
                  <path
                    id="path860"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m51.013 71.761c-0.8 0.031-1.555 0.372-2.098 0.949-0.543 0.576-0.83 1.341-0.797 2.125 0.125 5.017-1.024 11.079 0.53 13.142 1.791 0.78 2.817 0.691 2.817 0.691l2.418-0.839c0.597-1.95 0.612-5.071 0.266-13.142-0.008-0.8-0.346-1.562-0.937-2.114-0.591-0.551-1.384-0.844-2.199-0.812z"
                  />
                  <path
                    id="path861"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m66.391 69.721c-1.117-0.016-2.151 0.574-2.688 1.535-0.538 0.96-0.489 2.132 0.125 3.047 3.154 4.809 4.913 7.188 6.031 8.483 0.559 0.648 0.938 1.024 1.447 1.389 0.255 0.183 0.532 0.376 1.056 0.533 0.261 0.078 0.597 0.157 0.995 0.147 0.198-0.005 0.414-0.037 0.633-0.088 0.219-0.052 0.633-0.237 0.633-0.237 1.019-0.483 1.676-1.485 1.702-2.594 0.025-1.11-0.585-2.14-1.581-2.667-0.023-0.024 0-0.011-0.272-0.325-0.786-0.912-2.497-3.135-5.578-7.834-0.541-0.848-1.483-1.371-2.503-1.389z"
                  />
                  <path
                    id="path862"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m75.679 58.548c-1.329 0.149-2.399 1.137-2.629 2.429-0.23 1.291 0.435 2.576 1.633 3.158 3.491 1.765 7.812 5.214 10.705 4.658 2.394-0.453 2.599-2.077 2.407-3.701-0.398-1.56-1.788-2.346-10.337-6.219-0.545-0.284-1.166-0.398-1.779-0.325z"
                  />
                  <path
                    id="path863"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m91.962 43.562c-0.33 0.007-0.656 0.067-0.965 0.177-0.191 0.018-0.38 0.029-1.056 0.059-1.814 0.081-5.579 0.148-13.177 0.148-1.087-0.015-2.099 0.545-2.647 1.466-0.548 0.92-0.548 2.059 0 2.98s1.56 1.481 2.647 1.466c7.643 0 11.453-0.089 13.449-0.178 0.998-0.044 1.544-0.062 1.96-0.118 0.208-0.028 0.347-0.04 0.693-0.148 0.173-0.054 0.399-0.106 0.815-0.384 0.104-0.07 0.232-0.179 0.361-0.296 0.13-0.117 0.422-0.443 0.423-0.443l0.361-0.739c0.001 0 0.181-0.975 0.181-0.975 0.017-0.8-0.298-1.571-0.872-2.139s-1.358-0.884-2.173-0.876z"
                  />
                  <path
                    id="path864"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m90.973 27.978c-3.183 0-3.184-0.191-14.601 2.814-1.085 0.217-1.961 0.999-2.282 2.038-0.322 1.038-0.038 2.166 0.741 2.937 0.779 0.772 1.926 1.063 2.989 0.76 5.22-1.248 13.699-2.75 14.003-4.54 1.507-1.532 0.229-2.673-0.85-4.009z"
                  />
                  <path
                    id="path865"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-ffbb00"]} ${styles["fill-opacity-98077"]}`}
                    d="m75.992 10.633c-1.791 0.975-3.973 2.939-9.752 11.262-0.899 1.379-0.487 3.212 0.92 4.094 1.407 0.881 3.277 0.478 4.176-0.902 2.949-4.524 7.449-9.762 7.828-11.627-0.262-1.527-1.717-2.665-3.172-2.827z"
                  />
                  <path
                    id="path911"
                    className={`${styles["fill-rule-evenodd"]} ${styles["fill-radialGradient915"]}`}
                    d="m58.218 41.782c0 6.607-5.606 11.97-12.514 11.97s-12.514-5.363-12.514-11.97c0-6.608 5.606-11.97 12.514-11.97s12.514 5.362 12.514 11.97z"
                  />
                </g>
              </svg>
              <h3 className="ml-2 text-lg font-semibold text-gray-800">
                Same day service available
              </h3>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              Help comes quick, and we get the job done.
            </p>
          </div>

          {/* 100% Satisfaction Guarantee */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 1000 1000"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(-616.59052,664.22827)">
                  <g transform="matrix(7.545273,0,0,7.545273,-5983.2438,-2611.6783)">
                    <circle
                      r="65.266655"
                      cx="940.96454"
                      cy="324.36865"
                      fill="#f0f0f0"
                      stroke="#505050"
                      strokeWidth="2"
                    />
                    <ellipse
                      rx="8.1583309"
                      ry="13.053329"
                      cx="921.38452"
                      cy="301.52533"
                      fill="#505050"
                    />
                    <ellipse
                      transform="scale(-1,1)"
                      cy="301.52533"
                      cx="-960.54449"
                      ry="13.053329"
                      rx="8.1583309"
                      fill="#505050"
                    />
                    <path
                      d="m 901.80453,340.68534 a 44.054988,44.054988 0 0 0 78.31998,0 42.423322,42.423322 0 0 1 -78.31998,0"
                      fill="none"
                      stroke="#505050"
                      strokeWidth="2.44749928"
                    />
                  </g>
                </g>
              </svg>
              <h3 className="ml-2 text-lg font-semibold text-gray-800">
                100% Satisfaction Guarantee
              </h3>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              If you're not happy, we'll make it right.
            </p>
          </div>

          {/* On Call 7 Days a Week */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="calendar">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.36246 5.86475C6.05785 5.86475 5 6.92259 5 8.22659V24.6407C5 25.9454 6.05785 27.0032 7.36246 27.0032H24.6818C25.9871 27.0032 27.0443 25.9454 27.0443 24.6407V8.22659C27.0443 6.92259 25.9871 5.86475 24.6818 5.86475H7.36246Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.8219 12.689C10.8219 12.169 10.4004 11.7474 9.88038 11.7474C9.36099 11.7474 8.93945 12.169 8.93945 12.689C8.93945 13.209 9.36099 13.6305 9.88038 13.6305C10.4004 13.6305 10.8219 13.209 10.8219 12.689Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.8219 12.689C10.8219 12.169 10.4004 11.7474 9.88038 11.7474C9.36099 11.7474 8.93945 12.169 8.93945 12.689C8.93945 13.209 9.36099 13.6305 9.88038 13.6305C10.4004 13.6305 10.8219 13.209 10.8219 12.689Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.0094 12.689C19.0094 12.169 18.5879 11.7474 18.0679 11.7474C17.5485 11.7474 17.127 12.169 17.127 12.689C17.127 13.209 17.5485 13.6305 18.0679 13.6305C18.5879 13.6305 19.0094 13.209 19.0094 12.689Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.0094 12.689C19.0094 12.169 18.5879 11.7474 18.0679 11.7474C17.5485 11.7474 17.127 12.169 17.127 12.689C17.127 13.209 17.5485 13.6305 18.0679 13.6305C18.5879 13.6305 19.0094 13.209 19.0094 12.689Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23.1051 12.689C23.1051 12.169 22.6836 11.7474 22.1636 11.7474C21.6442 11.7474 21.2227 12.169 21.2227 12.689C21.2227 13.209 21.6442 13.6305 22.1636 13.6305C22.6836 13.6305 23.1051 13.209 23.1051 12.689Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23.1051 12.689C23.1051 12.169 22.6836 11.7474 22.1636 11.7474C21.6442 11.7474 21.2227 12.169 21.2227 12.689C21.2227 13.209 21.6442 13.6305 22.1636 13.6305C22.6836 13.6305 23.1051 13.209 23.1051 12.689Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.8219 16.7836C10.8219 16.2636 10.4004 15.842 9.88038 15.842C9.36099 15.842 8.93945 16.2636 8.93945 16.7836C8.93945 17.3036 9.36099 17.7251 9.88038 17.7251C10.4004 17.7251 10.8219 17.3036 10.8219 16.7836Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.8219 16.7836C10.8219 16.2636 10.4004 15.842 9.88038 15.842C9.36099 15.842 8.93945 16.2636 8.93945 16.7836C8.93945 17.3036 9.36099 17.7251 9.88038 17.7251C10.4004 17.7251 10.8219 17.3036 10.8219 16.7836Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.88099 19.937C9.36099 19.937 8.93945 20.3586 8.93945 20.8785C8.93945 21.3979 9.36099 21.8195 9.88099 21.8195C10.401 21.8195 10.8225 21.3979 10.8225 20.8785C10.8225 20.3586 10.401 19.937 9.88099 19.937Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.88099 19.937C9.36099 19.937 8.93945 20.3586 8.93945 20.8785C8.93945 21.3979 9.36099 21.8195 9.88099 21.8195C10.401 21.8195 10.8225 21.3979 10.8225 20.8785C10.8225 20.3586 10.401 19.937 9.88099 19.937Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.9166 12.689C14.9166 12.169 14.4951 11.7474 13.9751 11.7474C13.4557 11.7474 13.0342 12.169 13.0342 12.689C13.0342 13.209 13.4557 13.6305 13.9751 13.6305C14.4951 13.6305 14.9166 13.209 14.9166 12.689Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.9166 12.689C14.9166 12.169 14.4951 11.7474 13.9751 11.7474C13.4557 11.7474 13.0342 12.169 13.0342 12.689C13.0342 13.209 13.4557 13.6305 13.9751 13.6305C14.4951 13.6305 14.9166 13.209 14.9166 12.689Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.9166 16.7836C14.9166 16.2636 14.4951 15.842 13.9751 15.842C13.4557 15.842 13.0342 16.2636 13.0342 16.7836C13.0342 17.3036 13.4557 17.7251 13.9751 17.7251C14.4951 17.7251 14.9166 17.3036 14.9166 16.7836Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.9166 16.7836C14.9166 16.2636 14.4951 15.842 13.9751 15.842C13.4557 15.842 13.0342 16.2636 13.0342 16.7836C13.0342 17.3036 13.4557 17.7251 13.9751 17.7251C14.4951 17.7251 14.9166 17.3036 14.9166 16.7836Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9747 19.937C13.4547 19.937 13.0332 20.3586 13.0332 20.8786C13.0332 21.3979 13.4547 21.8195 13.9747 21.8195C14.4947 21.8195 14.9163 21.3979 14.9163 20.8786C14.9163 20.3586 14.4947 19.937 13.9747 19.937Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9747 19.937C13.4547 19.937 13.0332 20.3586 13.0332 20.8786C13.0332 21.3979 13.4547 21.8195 13.9747 21.8195C14.4947 21.8195 14.9163 21.3979 14.9163 20.8786C14.9163 20.3586 14.4947 19.937 13.9747 19.937Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.0094 16.7836C19.0094 16.2636 18.5879 15.842 18.0679 15.842C17.5485 15.842 17.127 16.2636 17.127 16.7836C17.127 17.3036 17.5485 17.7251 18.0679 17.7251C18.5879 17.7251 19.0094 17.3036 19.0094 16.7836Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.0094 16.7836C19.0094 16.2636 18.5879 15.842 18.0679 15.842C17.5485 15.842 17.127 16.2636 17.127 16.7836C17.127 17.3036 17.5485 17.7251 18.0679 17.7251C18.5879 17.7251 19.0094 17.3036 19.0094 16.7836Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22.1652 15.8423C21.6452 15.8423 21.2236 16.2638 21.2236 16.7838C21.2236 17.3032 21.6452 17.7247 22.1652 17.7247C22.6852 17.7247 23.1067 17.3032 23.1067 16.7838C23.1067 16.2638 22.6852 15.8423 22.1652 15.8423Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22.1652 15.8423C21.6452 15.8423 21.2236 16.2638 21.2236 16.7838C21.2236 17.3032 21.6452 17.7247 22.1652 17.7247C22.6852 17.7247 23.1067 17.3032 23.1067 16.7838C23.1067 16.2638 22.6852 15.8423 22.1652 15.8423Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22.1652 19.937C21.6452 19.937 21.2236 20.3586 21.2236 20.8785C21.2236 21.3979 21.6452 21.8195 22.1652 21.8195C22.6852 21.8195 23.1067 21.3979 23.1067 20.8785C23.1067 20.3586 22.6852 19.937 22.1652 19.937Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22.1652 19.937C21.6452 19.937 21.2236 20.3586 21.2236 20.8785C21.2236 21.3979 21.6452 21.8195 22.1652 21.8195C22.6852 21.8195 23.1067 21.3979 23.1067 20.8785C23.1067 20.3586 22.6852 19.937 22.1652 19.937Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.0685 19.937C17.5485 19.937 17.127 20.3586 17.127 20.8785C17.127 21.3979 17.5485 21.8195 18.0685 21.8195C18.5885 21.8195 19.01 21.3979 19.01 20.8785C19.01 20.3586 18.5885 19.937 18.0685 19.937Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.0685 19.937C17.5485 19.937 17.127 20.3586 17.127 20.8785C17.127 21.3979 17.5485 21.8195 18.0685 21.8195C18.5885 21.8195 19.01 21.3979 19.01 20.8785C19.01 20.3586 18.5885 19.937 18.0685 19.937Z"
                    stroke="currentColor"
                    strokeWidth="0.502"
                  />
                  <path
                    d="M10.1797 4V7.632"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.0215 4V7.632"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.8643 4V7.632"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
              <h3 className="ml-2 text-lg font-semibold text-gray-800">
                On call 7 days a week
              </h3>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              HelpAllRound is always helpful! We're here to help you 7 days a week.
            </p>
          </div>
        </div>

        {/* Book Now Button */}
        <div className="flex justify-center mt-12">
          <Link href="/book/login">
            <button className="bg-red-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-red-700 transition cursor-pointer">
              Book Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
