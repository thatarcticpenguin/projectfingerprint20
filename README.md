# AMBULANCE ROUTING SYSTEM
A react project built for predicting and selecting the best hospital taking into condsideration the number of beds, number of icu beds, and number of specialists available. Includes map and direction integration.

## 📌 Overview
In medical emergencies, every second saved translates to a life protected. Our project provides an energy-efficient digital infrastructure that allows hospitals to update their resource availability (beds, ICUs, specialists) in real-time. By utilizing Leaflet-based mapping, we ensure ambulances are routed to the most "ready" medical facility, minimizing transit time and fuel consumption.

## ✨ Core Features

- Views for both paramedics and hospital admin.
- Real-time updates to all dashboards and views from the cloud.
- Authentication for hospitals and users via Firebase.
- Map integration that shows all hospitals in the map.
- Shows directions and links to google maps
- Hospital dashboard: Can view patient details if sent and can edit bed/specialist availability.
- Paramedic enters details in the form, which is used to find and score nearby hospitals based on the below scoring formula
```
(beds/maxBeds)*0.35 + (icu/maxIcu)*0.30 + (specialists/maxSpec)*0.20 + (1/travelTime)*0.15
```
- Comes with translator at Patient Form
- Para medic can alert the hospital ahead of time so they are prepared for their arrival.
## 🎬 Setup Instructions
- Make sure latest version on `nodejs` and `npm` is installed.
- Once the above are installed and working, open a terminal clone the repository.
```
git clone https://github.com/thatarcticpenguin/projectARS.git
```
- Once the repository is cloned, move into the directory.
```
cd projectARS
```
- Run the below command to install the project requirements:
```
npm install react react-router-dom leaflet leaflet-routing-machine --force
```
- Once installed, run the below command to start the web server on localhost.
```
npm run dev
```
- The website will open in localhost (most likely localhost:1573)

## 💻 Workflow

### Paramedic Page
- Open homepage of the site, login page appears
- Open the paramedic login and use any phone number and click verify OTP.
- Enter the demo OTP "1234".

### Paramedic form
- System asks for current location access, click allow.
- Once location initializes, select any department and any condition from the dropdown and click search facilities [OR] click on red golden hour button for traumacare override.

### Map and scoring
- Top 2 best hospitals are shown according to scoring logic.
- Select any of the hospitals from the list.
- The map UI opens, you can select any hospital from the map view or choose the preselected hospital.
- Once a hospitals is selected, click on "Start Directions".
- Once you have fixed your hospital, click on "Send patient details to Hospital".

### Hospital Dashboard
- Return to the homepage and open the hospital admin tab.
- Login to the hospital that you had previously selected in the map.

**Hospital Credentials:**

1. **Apollo Diagnostics, Vijayawada** — `APOVJAC001` / `33330000`
2. **Vijaya Super Speciality Hospital, Vijayawada** — `VIJVJAC001` / `324324`
3. **Manipal Hospital, Vijayawada** — `MANVJAC001` / `243000`
4. **Manvi Hospital, Vijayawada** — `MVIVJAC001` / `9275097`
5. **Srikara Hospitals, Vijayawada** — `SRIVJAOT001` / `0823754`
6. **Ankura Hospital for Children and Women, Vijayawada** — `ANKVJAKN001` / `0923533`
7. **Mithra Multispeciality Hospital, Vijayawada** — `MITMVJAC001` / `mithra123`
8. **Royal Hospitals, Vijayawada** — `ROYVJAC001` / `royal123`
9. **Latha Super Speciality Hospital, Vijayawada** — `LATVJAC001` / `latha123`
10. **Anil Neuro and Trauma Care, Vijayawada** — `ANIVJAC001` / `anil123`
11. **Capital Hospitals, Vijayawada** — `CAPVJAC001` / `capital123`

- Once logged in, try editing the beds or icu beds or specialists, and click update availability, notice that data gets changed in maps and list of best hospitals. Data will persist in cloud.
- Go to the "Incoming Patients" tab and find the form you had earlier filled appearing in the dashboard of the hospital you selected in the map.
- Try clearing the user, in the case he/she has been cleared from the hospital.

## 👥 Team Contributions

Our team collaborated across the full stack to ensure a seamless integration between the ambulance interface and hospital databases.

🛠️ Tech Stack

  - Frontend: React.js (Component-based UI) (Srujana)
  - Hospital Dashboard (Sai Ram K)
  - Patient Form (Sreehaas BVS)
  - Mapping: Leaflet (Open-source mapping & routing) (Laasya)
  - Backend: Node.js (Sreehaas BVS)
  - Database: Firebase / Cloud Firestore (Real-time NoSQL database) (Sabareesh V)
  - Security: Firebase Auth (Sabareesh V)
