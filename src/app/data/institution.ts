export type Institution = {
    id: string;
    name: string;
    type: string;
    state: string;
};

export const institutionTypes = [
    "University",
    "Polytechnic",
    "College of Education",
    "College of Health",
    "College of Agriculture",
    "College of Nursing/Midwifery",
    "Monotechnic",
    "Other Tertiary Institution",
];

export const institutions: Institution[] = [
    // Universities
    {
        id: "fuoye",
        name: "Federal University Oye-Ekiti",
        type: "University",
        state: "Ekiti",
    },
    {
        id: "oau",
        name: "Obafemi Awolowo University",
        type: "University",
        state: "Osun",
    },
    {
        id: "ui",
        name: "University of Ibadan",
        type: "University",
        state: "Oyo",
    },
    {
        id: "unilag",
        name: "University of Lagos",
        type: "University",
        state: "Lagos",
    },
    {
        id: "unilorin",
        name: "University of Ilorin",
        type: "University",
        state: "Kwara",
    },
    {
        id: "abu",
        name: "Ahmadu Bello University",
        type: "University",
        state: "Kaduna",
    },
    {
        id: "covenant",
        name: "Covenant University",
        type: "University",
        state: "Ogun",
    },

    // Polytechnics
    {
        id: "yabatech",
        name: "Yaba College of Technology",
        type: "Polytechnic",
        state: "Lagos",
    },
    {
        id: "federal-poly-ilaro",
        name: "Federal Polytechnic, Ilaro",
        type: "Polytechnic",
        state: "Ogun",
    },
    {
        id: "federal-poly-bauchi",
        name: "Federal Polytechnic, Bauchi",
        type: "Polytechnic",
        state: "Bauchi",
    },

    // Colleges of Education
    {
        id: "fce-zuba",
        name: "Federal College of Education, Zuba",
        type: "College of Education",
        state: "FCT",
    },
    {
        id: "fce-abeokuta",
        name: "Federal College of Education, Abeokuta",
        type: "College of Education",
        state: "Ogun",
    },
    {
        id: "coe-afaha-nsit",
        name: "Akwa Ibom State College of Education, Afaha-Nsit",
        type: "College of Education",
        state: "Akwa Ibom",
    },
];