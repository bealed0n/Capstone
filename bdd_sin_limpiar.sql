--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

-- Started on 2024-11-07 17:06:15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16638)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    user_id integer,
    tattoo_artist_id integer,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    reference_image_url text
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16637)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 229
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- TOC entry 223 (class 1259 OID 16481)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16480)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 222
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 236 (class 1259 OID 16696)
-- Name: design_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.design_requests (
    id integer NOT NULL,
    buyer_id integer,
    designer_id integer,
    project_id integer,
    messages text,
    reference_image character varying(255),
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.design_requests OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16695)
-- Name: design_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.design_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.design_requests_id_seq OWNER TO postgres;

--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 235
-- Name: design_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.design_requests_id_seq OWNED BY public.design_requests.id;


--
-- TOC entry 234 (class 1259 OID 16680)
-- Name: designer_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designer_projects (
    id integer NOT NULL,
    designer_id integer,
    title character varying(255) NOT NULL,
    description text,
    image character varying(255),
    price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    currency character varying(10) DEFAULT 'CLP'::character varying,
    is_available boolean DEFAULT true
);


ALTER TABLE public.designer_projects OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16679)
-- Name: designer_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designer_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designer_projects_id_seq OWNER TO postgres;

--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 233
-- Name: designer_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designer_projects_id_seq OWNED BY public.designer_projects.id;


--
-- TOC entry 224 (class 1259 OID 16514)
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    follower_id integer NOT NULL,
    following_id integer NOT NULL,
    followed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16464)
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    liked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16659)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    content text NOT NULL,
    image_url character varying(255),
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16658)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 231
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 220 (class 1259 OID 16450)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    image character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16449)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 219
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 228 (class 1259 OID 16623)
-- Name: tattoo_artist_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tattoo_artist_availability (
    id integer NOT NULL,
    tattoo_artist_id integer,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    description text
);


ALTER TABLE public.tattoo_artist_availability OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16622)
-- Name: tattoo_artist_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tattoo_artist_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tattoo_artist_availability_id_seq OWNER TO postgres;

--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 227
-- Name: tattoo_artist_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tattoo_artist_availability_id_seq OWNED BY public.tattoo_artist_availability.id;


--
-- TOC entry 226 (class 1259 OID 16532)
-- Name: tattooist_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tattooist_applications (
    id integer NOT NULL,
    user_id integer,
    carnet_image character varying(255),
    antecedentes_image character varying(255),
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tattooist_applications OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16531)
-- Name: tattooist_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tattooist_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tattooist_applications_id_seq OWNER TO postgres;

--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 225
-- Name: tattooist_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tattooist_applications_id_seq OWNED BY public.tattooist_applications.id;


--
-- TOC entry 218 (class 1259 OID 16401)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    bio text,
    profile_pic character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16400)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4746 (class 2604 OID 16641)
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- TOC entry 4738 (class 2604 OID 16484)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4755 (class 2604 OID 16699)
-- Name: design_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_requests ALTER COLUMN id SET DEFAULT nextval('public.design_requests_id_seq'::regclass);


--
-- TOC entry 4751 (class 2604 OID 16683)
-- Name: designer_projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designer_projects ALTER COLUMN id SET DEFAULT nextval('public.designer_projects_id_seq'::regclass);


--
-- TOC entry 4748 (class 2604 OID 16662)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4735 (class 2604 OID 16453)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 16626)
-- Name: tattoo_artist_availability id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tattoo_artist_availability ALTER COLUMN id SET DEFAULT nextval('public.tattoo_artist_availability_id_seq'::regclass);


--
-- TOC entry 4741 (class 2604 OID 16535)
-- Name: tattooist_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tattooist_applications ALTER COLUMN id SET DEFAULT nextval('public.tattooist_applications_id_seq'::regclass);


--
-- TOC entry 4732 (class 2604 OID 16404)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4957 (class 0 OID 16638)
-- Dependencies: 230
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, user_id, tattoo_artist_id, date, "time", description, status, reference_image_url) FROM stdin;
13	1	12	2024-11-01	09:00:00	quiero este	pending	/uploads/reference_image-1730318137903.jpg
5	1	12	2024-02-24	12:00:00	Tatuaje de leon	rejected	\N
14	1	12	2024-10-28	09:00:00	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia	Pending	/uploads/reference_image-1730925456236.jpg
\.


--
-- TOC entry 4950 (class 0 OID 16481)
-- Dependencies: 223
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, post_id, user_id, content, created_at) FROM stdin;
1	35	12	ESTA MUY BONITO	2024-11-01 13:26:43.27048
2	34	13	BONITO DISENO	2024-11-01 13:26:57.437403
3	35	12	jeje	2024-11-07 15:59:17.740552
\.


--
-- TOC entry 4963 (class 0 OID 16696)
-- Dependencies: 236
-- Data for Name: design_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.design_requests (id, buyer_id, designer_id, project_id, messages, reference_image, status, created_at) FROM stdin;
\.


--
-- TOC entry 4961 (class 0 OID 16680)
-- Dependencies: 234
-- Data for Name: designer_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designer_projects (id, designer_id, title, description, image, price, created_at, currency, is_available) FROM stdin;
1	13	proyecto a venta	me costo mxo	/uploads/image-1730990578462.jpg	30000.00	2024-11-07 11:42:58.48985	CLP	t
\.


--
-- TOC entry 4951 (class 0 OID 16514)
-- Dependencies: 224
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows (follower_id, following_id, followed_at) FROM stdin;
1	12	2024-10-22 19:46:58.95372
12	1	2024-10-22 19:47:14.804774
\.


--
-- TOC entry 4948 (class 0 OID 16464)
-- Dependencies: 221
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (post_id, user_id, liked_at) FROM stdin;
35	12	2024-11-04 15:28:20.364865
34	12	2024-11-04 15:28:25.686294
35	1	2024-11-05 12:16:30.172887
35	13	2024-11-07 15:59:00.250854
\.


--
-- TOC entry 4959 (class 0 OID 16659)
-- Dependencies: 232
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, image_url, sent_at, is_read) FROM stdin;
1	12	1	Your appointment has been accepted. Please bring your ID.	\N	2024-10-31 13:12:16.528725	f
2	12	1	Your appointment has been pending.	\N	2024-10-31 13:18:57.329138	f
3	12	1	Your appointment has been accepted. 	\N	2024-10-31 13:19:26.092503	f
4	12	1	Your appointment has been pending.	\N	2024-10-31 13:19:28.509556	f
5	12	1	Your appointment has been accepted. 	\N	2024-10-31 13:23:57.502826	f
6	12	1	Your appointment has been accepted. 	\N	2024-10-31 13:24:01.396621	f
7	12	1	Your appointment has been rejected.	\N	2024-10-31 13:24:03.61296	f
8	12	1	Your appointment has been accepted. 	\N	2024-10-31 13:24:05.89879	f
9	12	1	Your appointment has been accepted. 	\N	2024-10-31 16:52:07.446307	f
10	12	1	Your appointment has been rejected.	\N	2024-10-31 16:59:30.863944	f
11	12	1	Your appointment has been rejected.	\N	2024-11-04 13:12:34.951647	f
12	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:37.549393	f
13	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:40.188733	f
14	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:42.255111	f
15	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:42.260928	f
16	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:42.265115	f
17	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:42.28269	f
18	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:42.283689	f
19	12	1	Your appointment has been pending.	\N	2024-11-04 13:12:42.285577	f
20	12	1	Your appointment has been pending.	\N	2024-11-04 13:16:10.508221	f
21	12	1	Your appointment has been accepted. 	\N	2024-11-04 13:38:35.165684	f
22	12	1	Your appointment has been rejected.	\N	2024-11-04 13:41:01.184643	f
23	12	1	asdasd	\N	2024-11-05 15:58:46.085324	f
24	1	12	ddf	\N	2024-11-05 15:58:51.028229	f
25	1	12	de	\N	2024-11-05 15:58:52.064475	f
33	1	12	udjjdjf	\N	2024-11-05 16:39:52.525035	f
34	1	12	jdndkdnf	\N	2024-11-05 16:40:08.993259	f
35	12	1	asd	\N	2024-11-05 17:49:00.104326	f
36	1	12	vh	\N	2024-11-05 18:17:27.169981	f
37	12	1	porque	\N	2024-11-05 18:53:47.932115	f
38	12	1	sisisi	\N	2024-11-05 18:53:53.003914	f
39	1	12	jadjaja	\N	2024-11-05 18:55:04.583091	f
40	12	1	asd	\N	2024-11-05 18:58:28.371074	f
41	1	12	fg	\N	2024-11-05 18:58:41.256131	f
42	12	1	Si es buenop	\N	2024-11-05 18:58:48.989589	f
43	1	12	es god	\N	2024-11-06 14:55:35.229314	f
44	1	12	si	\N	2024-11-06 14:55:37.888432	f
45	12	1	si	\N	2024-11-06 14:55:42.98202	f
46	12	1	😛😛😛😛	\N	2024-11-06 14:58:07.832247	f
47	1	12	t	\N	2024-11-06 14:58:35.961275	f
48	1	12	ndnd	\N	2024-11-06 15:01:51.508953	f
49	12	1		/uploads/message-1730920361585.png	2024-11-06 16:12:41.585878	f
50	12	1		/uploads/message-1730920366479.png	2024-11-06 16:12:46.479738	f
51	1	12		/uploads/message-1730920446594.png	2024-11-06 16:14:06.617658	f
52	12	1		/uploads/message-1730920495134.png	2024-11-06 16:14:55.15909	f
53	1	12		/uploads/message-1730920789824.png	2024-11-06 16:19:49.847617	f
54	12	1		/uploads/message-1730920809009.png	2024-11-06 16:20:09.033424	f
55	12	1	Sis este	/uploads/message-1730921807682.png	2024-11-06 16:36:47.709687	f
56	1	12	ya bueno	\N	2024-11-06 16:37:16.087974	f
57	1	12	pero	\N	2024-11-06 16:37:33.483588	f
58	1	12	kd	\N	2024-11-06 16:37:52.135752	f
59	1	12	si	\N	2024-11-06 16:39:26.48873	f
60	1	12	rata	/uploads/message-1730921978587.png	2024-11-06 16:39:38.612498	f
61	1	12	nndkdnfd	\N	2024-11-07 11:25:25.349601	f
\.


--
-- TOC entry 4947 (class 0 OID 16450)
-- Dependencies: 220
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, user_id, content, image, created_at) FROM stdin;
31	12	Tatuaje de pp	/uploads/image-1729204042029.jpg	2024-10-17 19:27:22.100167
32	13	Diseños	/uploads/image-1729204074233.jpg	2024-10-17 19:27:54.307967
33	12	tattoo	/uploads/image-1729218554729.jpg	2024-10-17 23:29:16.861113
34	13	diseno	/uploads/image-1729218585839.jpg	2024-10-17 23:29:45.913472
35	12	tatuaje jeje	/uploads/image-1729642069264.jpg	2024-10-22 21:07:49.462982
\.


--
-- TOC entry 4955 (class 0 OID 16623)
-- Dependencies: 228
-- Data for Name: tattoo_artist_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tattoo_artist_availability (id, tattoo_artist_id, date, start_time, end_time, is_available, description) FROM stdin;
1	12	2024-02-24	12:00:00	18:00:00	t	tatuo a estas horas
2	12	2024-11-01	09:00:00	17:00:00	t	Disponible para citas
3	12	2024-10-28	09:00:00	18:00:00	t	Dia libre para tattos chicos
5	12	2024-10-30	10:00:00	18:00:00	t	open to work
4	12	2024-10-29	09:00:00	18:00:00	t	Proyectos grandes
\.


--
-- TOC entry 4953 (class 0 OID 16532)
-- Dependencies: 226
-- Data for Name: tattooist_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tattooist_applications (id, user_id, carnet_image, antecedentes_image, description, status, created_at) FROM stdin;
\.


--
-- TOC entry 4945 (class 0 OID 16401)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, bio, profile_pic, created_at, role) FROM stdin;
12	Tattoer	a@a2	$2b$10$VEzY/xG/Xdu4iuVH833YAOB/egEK59jLKclWjz6ah0C6hfgJHQKKm	\N	\N	2024-10-07 18:42:14.457854	tattoo_artist
13	Designer	a@a3	$2b$10$ZLbOnzqn0GEBBx9shniv1eTQ8LevSuivW0QIq1lqMoa2T/7T4M26q	\N	\N	2024-10-07 18:42:45.705605	Designer
1	Cliente	a@a	$2b$10$VsegHcuN/gPyYS9sh0Yg5uqfDYmMhZb9p41QOzTG1nMIzS.3Gjoqa	\N	\N	2024-10-07 18:18:41.208057	user
\.


--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 229
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 14, true);


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 222
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 3, true);


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 235
-- Name: design_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.design_requests_id_seq', 1, false);


--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 233
-- Name: designer_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.designer_projects_id_seq', 1, true);


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 231
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 61, true);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 219
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 35, true);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 227
-- Name: tattoo_artist_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tattoo_artist_availability_id_seq', 5, true);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 225
-- Name: tattooist_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tattooist_applications_id_seq', 1, false);


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- TOC entry 4775 (class 2606 OID 16646)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 16489)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 16705)
-- Name: design_requests design_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_requests
    ADD CONSTRAINT design_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 16688)
-- Name: designer_projects designer_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designer_projects
    ADD CONSTRAINT designer_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4769 (class 2606 OID 16519)
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id);


--
-- TOC entry 4765 (class 2606 OID 16469)
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (post_id, user_id);


--
-- TOC entry 4777 (class 2606 OID 16668)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 16458)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 16631)
-- Name: tattoo_artist_availability tattoo_artist_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tattoo_artist_availability
    ADD CONSTRAINT tattoo_artist_availability_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 16541)
-- Name: tattooist_applications tattooist_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tattooist_applications
    ADD CONSTRAINT tattooist_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4759 (class 2606 OID 16411)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4761 (class 2606 OID 16409)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 16652)
-- Name: appointments appointments_tattoo_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_tattoo_artist_id_fkey FOREIGN KEY (tattoo_artist_id) REFERENCES public.users(id);


--
-- TOC entry 4792 (class 2606 OID 16647)
-- Name: appointments appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4785 (class 2606 OID 16490)
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 4786 (class 2606 OID 16495)
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4796 (class 2606 OID 16706)
-- Name: design_requests design_requests_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_requests
    ADD CONSTRAINT design_requests_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4797 (class 2606 OID 16711)
-- Name: design_requests design_requests_designer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_requests
    ADD CONSTRAINT design_requests_designer_id_fkey FOREIGN KEY (designer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4798 (class 2606 OID 16716)
-- Name: design_requests design_requests_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_requests
    ADD CONSTRAINT design_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.designer_projects(id) ON DELETE SET NULL;


--
-- TOC entry 4795 (class 2606 OID 16689)
-- Name: designer_projects designer_projects_designer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designer_projects
    ADD CONSTRAINT designer_projects_designer_id_fkey FOREIGN KEY (designer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4787 (class 2606 OID 16520)
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4788 (class 2606 OID 16525)
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4783 (class 2606 OID 16470)
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 4784 (class 2606 OID 16475)
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4793 (class 2606 OID 16674)
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4794 (class 2606 OID 16669)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4782 (class 2606 OID 16459)
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4790 (class 2606 OID 16632)
-- Name: tattoo_artist_availability tattoo_artist_availability_tattoo_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tattoo_artist_availability
    ADD CONSTRAINT tattoo_artist_availability_tattoo_artist_id_fkey FOREIGN KEY (tattoo_artist_id) REFERENCES public.users(id);


--
-- TOC entry 4789 (class 2606 OID 16542)
-- Name: tattooist_applications tattooist_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tattooist_applications
    ADD CONSTRAINT tattooist_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2024-11-07 17:06:15

--
-- PostgreSQL database dump complete
--

