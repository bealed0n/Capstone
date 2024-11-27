PGDMP  0                
    |           ign-tattoo-test    17.0    17.0 {    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16388    ign-tattoo-test    DATABASE     �   CREATE DATABASE "ign-tattoo-test" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Spain.1252';
 !   DROP DATABASE "ign-tattoo-test";
                     postgres    false            �            1259    16638    appointments    TABLE     0  CREATE TABLE public.appointments (
    id integer NOT NULL,
    user_id integer,
    tattoo_artist_id integer,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    reference_image_url text
);
     DROP TABLE public.appointments;
       public         heap r       postgres    false            �            1259    16637    appointments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.appointments_id_seq;
       public               postgres    false    228            �           0    0    appointments_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;
          public               postgres    false    227            �            1259    16481    comments    TABLE     �   CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.comments;
       public         heap r       postgres    false            �            1259    16480    comments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.comments_id_seq;
       public               postgres    false    223            �           0    0    comments_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;
          public               postgres    false    222            �            1259    16680    designer_projects    TABLE     �  CREATE TABLE public.designer_projects (
    id integer NOT NULL,
    designer_id integer,
    title character varying(255) NOT NULL,
    description text,
    image character varying(255),
    price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    currency character varying(10) DEFAULT 'CLP'::character varying,
    is_available boolean DEFAULT true,
    is_requested boolean
);
 %   DROP TABLE public.designer_projects;
       public         heap r       postgres    false            �            1259    16679    designer_projects_id_seq    SEQUENCE     �   CREATE SEQUENCE public.designer_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.designer_projects_id_seq;
       public               postgres    false    232            �           0    0    designer_projects_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.designer_projects_id_seq OWNED BY public.designer_projects.id;
          public               postgres    false    231            �            1259    16514    follows    TABLE     �   CREATE TABLE public.follows (
    follower_id integer NOT NULL,
    following_id integer NOT NULL,
    followed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.follows;
       public         heap r       postgres    false            �            1259    16464    likes    TABLE     �   CREATE TABLE public.likes (
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    liked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.likes;
       public         heap r       postgres    false            �            1259    16659    messages    TABLE       CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    content text NOT NULL,
    image_url character varying(255),
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);
    DROP TABLE public.messages;
       public         heap r       postgres    false            �            1259    16658    messages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.messages_id_seq;
       public               postgres    false    230            �           0    0    messages_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
          public               postgres    false    229            �            1259    16450    posts    TABLE     �   CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    image character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.posts;
       public         heap r       postgres    false            �            1259    16449    posts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.posts_id_seq;
       public               postgres    false    220            �           0    0    posts_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;
          public               postgres    false    219            �            1259    25025    postulaciones    TABLE     :  CREATE TABLE public.postulaciones (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    requisitos character varying(255),
    aprobado boolean DEFAULT false
);
 !   DROP TABLE public.postulaciones;
       public         heap r       postgres    false            �            1259    25024    postulaciones_id_seq    SEQUENCE     �   CREATE SEQUENCE public.postulaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.postulaciones_id_seq;
       public               postgres    false    244            �           0    0    postulaciones_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.postulaciones_id_seq OWNED BY public.postulaciones.id;
          public               postgres    false    243            �            1259    16724    requested_design    TABLE     o  CREATE TABLE public.requested_design (
    id integer NOT NULL,
    user_id integer NOT NULL,
    designer_id integer NOT NULL,
    project_id integer NOT NULL,
    price numeric(10,2) NOT NULL,
    status character varying(15) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image character varying
);
 $   DROP TABLE public.requested_design;
       public         heap r       postgres    false            �            1259    16723    requested_design_id_seq    SEQUENCE     �   CREATE SEQUENCE public.requested_design_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.requested_design_id_seq;
       public               postgres    false    234            �           0    0    requested_design_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.requested_design_id_seq OWNED BY public.requested_design.id;
          public               postgres    false    233            �            1259    24996    reviews    TABLE     �  CREATE TABLE public.reviews (
    id integer NOT NULL,
    appointment_id integer NOT NULL,
    tattoo_artist_id integer NOT NULL,
    client_username character varying(100) NOT NULL,
    review_text text,
    rating integer,
    is_published boolean DEFAULT false,
    tattoo_image_url text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 10)))
);
    DROP TABLE public.reviews;
       public         heap r       postgres    false            �            1259    24995    reviews_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.reviews_id_seq;
       public               postgres    false    242            �           0    0    reviews_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
          public               postgres    false    241            �            1259    24928    studio_invitations    TABLE     g  CREATE TABLE public.studio_invitations (
    id integer NOT NULL,
    studio_id integer NOT NULL,
    slot_id integer NOT NULL,
    tattoo_artist_id integer NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
 &   DROP TABLE public.studio_invitations;
       public         heap r       postgres    false            �            1259    24927    studio_invitations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.studio_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.studio_invitations_id_seq;
       public               postgres    false    240            �           0    0    studio_invitations_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.studio_invitations_id_seq OWNED BY public.studio_invitations.id;
          public               postgres    false    239            �            1259    16752    studio_slots    TABLE       CREATE TABLE public.studio_slots (
    id integer NOT NULL,
    studio_id integer NOT NULL,
    slot_number integer NOT NULL,
    assigned_tattoo_artist_id integer,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
     DROP TABLE public.studio_slots;
       public         heap r       postgres    false            �            1259    16751    studio_slots_id_seq    SEQUENCE     �   CREATE SEQUENCE public.studio_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.studio_slots_id_seq;
       public               postgres    false    238            �           0    0    studio_slots_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.studio_slots_id_seq OWNED BY public.studio_slots.id;
          public               postgres    false    237            �            1259    16623    tattoo_artist_availability    TABLE     �   CREATE TABLE public.tattoo_artist_availability (
    id integer NOT NULL,
    tattoo_artist_id integer,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    description text
);
 .   DROP TABLE public.tattoo_artist_availability;
       public         heap r       postgres    false            �            1259    16622 !   tattoo_artist_availability_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tattoo_artist_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.tattoo_artist_availability_id_seq;
       public               postgres    false    226            �           0    0 !   tattoo_artist_availability_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.tattoo_artist_availability_id_seq OWNED BY public.tattoo_artist_availability.id;
          public               postgres    false    225            �            1259    16736    tattoo_studios    TABLE     l  CREATE TABLE public.tattoo_studios (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    name character varying(100) NOT NULL,
    address text NOT NULL,
    description text,
    image_url character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying
);
 "   DROP TABLE public.tattoo_studios;
       public         heap r       postgres    false            �            1259    16735    tattoo_studios_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tattoo_studios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.tattoo_studios_id_seq;
       public               postgres    false    236            �           0    0    tattoo_studios_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.tattoo_studios_id_seq OWNED BY public.tattoo_studios.id;
          public               postgres    false    235            �            1259    16401    users    TABLE     G  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    bio text,
    profile_pic character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) DEFAULT 'user'::character varying,
    name character varying(90),
    is_verified boolean DEFAULT false,
    verification_token text,
    reset_password_token character varying(64),
    reset_password_expires timestamp without time zone
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16400    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            �           2604    16641    appointments id    DEFAULT     r   ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);
 >   ALTER TABLE public.appointments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    16484    comments id    DEFAULT     j   ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);
 :   ALTER TABLE public.comments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222    223            �           2604    16683    designer_projects id    DEFAULT     |   ALTER TABLE ONLY public.designer_projects ALTER COLUMN id SET DEFAULT nextval('public.designer_projects_id_seq'::regclass);
 C   ALTER TABLE public.designer_projects ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    232    232            �           2604    16662    messages id    DEFAULT     j   ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
 :   ALTER TABLE public.messages ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    230    230            �           2604    16453    posts id    DEFAULT     d   ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);
 7   ALTER TABLE public.posts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    25028    postulaciones id    DEFAULT     t   ALTER TABLE ONLY public.postulaciones ALTER COLUMN id SET DEFAULT nextval('public.postulaciones_id_seq'::regclass);
 ?   ALTER TABLE public.postulaciones ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    243    244            �           2604    16727    requested_design id    DEFAULT     z   ALTER TABLE ONLY public.requested_design ALTER COLUMN id SET DEFAULT nextval('public.requested_design_id_seq'::regclass);
 B   ALTER TABLE public.requested_design ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    234    234            �           2604    24999 
   reviews id    DEFAULT     h   ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);
 9   ALTER TABLE public.reviews ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    241    242    242            �           2604    24931    studio_invitations id    DEFAULT     ~   ALTER TABLE ONLY public.studio_invitations ALTER COLUMN id SET DEFAULT nextval('public.studio_invitations_id_seq'::regclass);
 D   ALTER TABLE public.studio_invitations ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    239    240    240            �           2604    16755    studio_slots id    DEFAULT     r   ALTER TABLE ONLY public.studio_slots ALTER COLUMN id SET DEFAULT nextval('public.studio_slots_id_seq'::regclass);
 >   ALTER TABLE public.studio_slots ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    238    238            �           2604    16626    tattoo_artist_availability id    DEFAULT     �   ALTER TABLE ONLY public.tattoo_artist_availability ALTER COLUMN id SET DEFAULT nextval('public.tattoo_artist_availability_id_seq'::regclass);
 L   ALTER TABLE public.tattoo_artist_availability ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    16739    tattoo_studios id    DEFAULT     v   ALTER TABLE ONLY public.tattoo_studios ALTER COLUMN id SET DEFAULT nextval('public.tattoo_studios_id_seq'::regclass);
 @   ALTER TABLE public.tattoo_studios ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    236    235    236            �           2604    16404    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            �          0    16638    appointments 
   TABLE DATA                 public               postgres    false    228   .�       �          0    16481    comments 
   TABLE DATA                 public               postgres    false    223   ��       �          0    16680    designer_projects 
   TABLE DATA                 public               postgres    false    232   #�       �          0    16514    follows 
   TABLE DATA                 public               postgres    false    224   ��       ~          0    16464    likes 
   TABLE DATA                 public               postgres    false    221   ڠ       �          0    16659    messages 
   TABLE DATA                 public               postgres    false    230   �       }          0    16450    posts 
   TABLE DATA                 public               postgres    false    220   �       �          0    25025    postulaciones 
   TABLE DATA                 public               postgres    false    244   m�       �          0    16724    requested_design 
   TABLE DATA                 public               postgres    false    234   ��       �          0    24996    reviews 
   TABLE DATA                 public               postgres    false    242   �       �          0    24928    studio_invitations 
   TABLE DATA                 public               postgres    false    240   %�       �          0    16752    studio_slots 
   TABLE DATA                 public               postgres    false    238   �       �          0    16623    tattoo_artist_availability 
   TABLE DATA                 public               postgres    false    226   �       �          0    16736    tattoo_studios 
   TABLE DATA                 public               postgres    false    236   B�       {          0    16401    users 
   TABLE DATA                 public               postgres    false    218   C�       �           0    0    appointments_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.appointments_id_seq', 21, true);
          public               postgres    false    227            �           0    0    comments_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.comments_id_seq', 16, true);
          public               postgres    false    222            �           0    0    designer_projects_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.designer_projects_id_seq', 5, true);
          public               postgres    false    231            �           0    0    messages_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.messages_id_seq', 117, true);
          public               postgres    false    229            �           0    0    posts_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.posts_id_seq', 39, true);
          public               postgres    false    219            �           0    0    postulaciones_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.postulaciones_id_seq', 3, true);
          public               postgres    false    243            �           0    0    requested_design_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.requested_design_id_seq', 11, true);
          public               postgres    false    233            �           0    0    reviews_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.reviews_id_seq', 2, true);
          public               postgres    false    241            �           0    0    studio_invitations_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.studio_invitations_id_seq', 7, true);
          public               postgres    false    239            �           0    0    studio_slots_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.studio_slots_id_seq', 30, true);
          public               postgres    false    237            �           0    0 !   tattoo_artist_availability_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.tattoo_artist_availability_id_seq', 9, true);
          public               postgres    false    225            �           0    0    tattoo_studios_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.tattoo_studios_id_seq', 7, true);
          public               postgres    false    235            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 36, true);
          public               postgres    false    217            �           2606    16646    appointments appointments_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_pkey;
       public                 postgres    false    228            �           2606    16489    comments comments_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_pkey;
       public                 postgres    false    223            �           2606    16688 (   designer_projects designer_projects_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.designer_projects
    ADD CONSTRAINT designer_projects_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.designer_projects DROP CONSTRAINT designer_projects_pkey;
       public                 postgres    false    232            �           2606    16519    follows follows_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id);
 >   ALTER TABLE ONLY public.follows DROP CONSTRAINT follows_pkey;
       public                 postgres    false    224    224            �           2606    16469    likes likes_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (post_id, user_id);
 :   ALTER TABLE ONLY public.likes DROP CONSTRAINT likes_pkey;
       public                 postgres    false    221    221            �           2606    16668    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public                 postgres    false    230            �           2606    16458    posts posts_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_pkey;
       public                 postgres    false    220            �           2606    25033     postulaciones postulaciones_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.postulaciones
    ADD CONSTRAINT postulaciones_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.postulaciones DROP CONSTRAINT postulaciones_pkey;
       public                 postgres    false    244            �           2606    16731 &   requested_design requested_design_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.requested_design
    ADD CONSTRAINT requested_design_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.requested_design DROP CONSTRAINT requested_design_pkey;
       public                 postgres    false    234            �           2606    25006    reviews reviews_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public                 postgres    false    242            �           2606    24936 *   studio_invitations studio_invitations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.studio_invitations
    ADD CONSTRAINT studio_invitations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.studio_invitations DROP CONSTRAINT studio_invitations_pkey;
       public                 postgres    false    240            �           2606    16759    studio_slots studio_slots_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.studio_slots
    ADD CONSTRAINT studio_slots_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.studio_slots DROP CONSTRAINT studio_slots_pkey;
       public                 postgres    false    238            �           2606    16631 :   tattoo_artist_availability tattoo_artist_availability_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.tattoo_artist_availability
    ADD CONSTRAINT tattoo_artist_availability_pkey PRIMARY KEY (id);
 d   ALTER TABLE ONLY public.tattoo_artist_availability DROP CONSTRAINT tattoo_artist_availability_pkey;
       public                 postgres    false    226            �           2606    16745 "   tattoo_studios tattoo_studios_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.tattoo_studios
    ADD CONSTRAINT tattoo_studios_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.tattoo_studios DROP CONSTRAINT tattoo_studios_pkey;
       public                 postgres    false    236            �           2606    16411    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    16409    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           2606    16652 /   appointments appointments_tattoo_artist_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_tattoo_artist_id_fkey FOREIGN KEY (tattoo_artist_id) REFERENCES public.users(id);
 Y   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_tattoo_artist_id_fkey;
       public               postgres    false    218    228    4791            �           2606    16647 &   appointments appointments_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_user_id_fkey;
       public               postgres    false    228    4791    218            �           2606    16490    comments comments_post_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_post_id_fkey;
       public               postgres    false    223    220    4793            �           2606    16495    comments comments_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_user_id_fkey;
       public               postgres    false    223    4791    218            �           2606    16689 4   designer_projects designer_projects_designer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.designer_projects
    ADD CONSTRAINT designer_projects_designer_id_fkey FOREIGN KEY (designer_id) REFERENCES public.users(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.designer_projects DROP CONSTRAINT designer_projects_designer_id_fkey;
       public               postgres    false    4791    232    218            �           2606    16520     follows follows_follower_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.follows DROP CONSTRAINT follows_follower_id_fkey;
       public               postgres    false    224    218    4791            �           2606    16525 !   follows follows_following_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.follows DROP CONSTRAINT follows_following_id_fkey;
       public               postgres    false    4791    224    218            �           2606    16470    likes likes_post_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.likes DROP CONSTRAINT likes_post_id_fkey;
       public               postgres    false    4793    220    221            �           2606    16475    likes likes_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.likes DROP CONSTRAINT likes_user_id_fkey;
       public               postgres    false    221    218    4791            �           2606    16674 "   messages messages_receiver_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_receiver_id_fkey;
       public               postgres    false    4791    230    218            �           2606    16669     messages messages_sender_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_sender_id_fkey;
       public               postgres    false    4791    218    230            �           2606    16459    posts posts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_user_id_fkey;
       public               postgres    false    220    218    4791            �           2606    25007 #   reviews reviews_appointment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_appointment_id_fkey;
       public               postgres    false    228    4803    242            �           2606    25012 %   reviews reviews_tattoo_artist_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tattoo_artist_id_fkey FOREIGN KEY (tattoo_artist_id) REFERENCES public.users(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_tattoo_artist_id_fkey;
       public               postgres    false    4791    242    218            �           2606    24942 2   studio_invitations studio_invitations_slot_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studio_invitations
    ADD CONSTRAINT studio_invitations_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.studio_slots(id) ON DELETE SET NULL;
 \   ALTER TABLE ONLY public.studio_invitations DROP CONSTRAINT studio_invitations_slot_id_fkey;
       public               postgres    false    4813    240    238            �           2606    24937 4   studio_invitations studio_invitations_studio_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studio_invitations
    ADD CONSTRAINT studio_invitations_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.tattoo_studios(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.studio_invitations DROP CONSTRAINT studio_invitations_studio_id_fkey;
       public               postgres    false    236    4811    240            �           2606    24947 ;   studio_invitations studio_invitations_tattoo_artist_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studio_invitations
    ADD CONSTRAINT studio_invitations_tattoo_artist_id_fkey FOREIGN KEY (tattoo_artist_id) REFERENCES public.users(id) ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.studio_invitations DROP CONSTRAINT studio_invitations_tattoo_artist_id_fkey;
       public               postgres    false    218    240    4791            �           2606    16765 8   studio_slots studio_slots_assigned_tattoo_artist_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studio_slots
    ADD CONSTRAINT studio_slots_assigned_tattoo_artist_id_fkey FOREIGN KEY (assigned_tattoo_artist_id) REFERENCES public.users(id);
 b   ALTER TABLE ONLY public.studio_slots DROP CONSTRAINT studio_slots_assigned_tattoo_artist_id_fkey;
       public               postgres    false    218    238    4791            �           2606    16760 (   studio_slots studio_slots_studio_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studio_slots
    ADD CONSTRAINT studio_slots_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.tattoo_studios(id);
 R   ALTER TABLE ONLY public.studio_slots DROP CONSTRAINT studio_slots_studio_id_fkey;
       public               postgres    false    4811    238    236            �           2606    16632 K   tattoo_artist_availability tattoo_artist_availability_tattoo_artist_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tattoo_artist_availability
    ADD CONSTRAINT tattoo_artist_availability_tattoo_artist_id_fkey FOREIGN KEY (tattoo_artist_id) REFERENCES public.users(id);
 u   ALTER TABLE ONLY public.tattoo_artist_availability DROP CONSTRAINT tattoo_artist_availability_tattoo_artist_id_fkey;
       public               postgres    false    4791    218    226            �           2606    16746 +   tattoo_studios tattoo_studios_owner_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tattoo_studios
    ADD CONSTRAINT tattoo_studios_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);
 U   ALTER TABLE ONLY public.tattoo_studios DROP CONSTRAINT tattoo_studios_owner_id_fkey;
       public               postgres    false    218    4791    236            �   H  x�ՒOk1��~���
��d��$ŃEl�Zz[��Q"��t���M�lK{��9��d~��\o�[X����ڷR�c�����6�����dNn��o���4)�A�FTط��Y{���V{���s�D���M9���j���0��baS�0�M��lF�-��v?�]%�ڍ�e�J4X�fҪR�BO:_�4H@�)	�Gu��z�?F�A��R�P�A�+�{+������M��2���u�a3p�	�Bԇ�HY�i��0�RFΤ�g�K��ь�Ns}2��9�����ju��o�JN�$�0�N/l"����n�4�,#rq��� td�      �   �  x���QK�0��}�{��w�]�Ƨ�
����O�[#N�v���oo:�T|2Ї�	܏�?�F��~�h2��v�\�ռ^�|�l�lQ�`]o�i[l7�}W��	�x�E��iќ����a����HH��;�'�{x���(����F�DH@�i��(� ��痝�-�`8XLh�E��,�~�H��$�&�˫�'�H������>����X@�30��TY�	G�^��tK@t�Tb5� ��n�3_տ ���٦Q���c�b���S�	Sr�N�Bbcm�_���cqȪO֚(���0��r�����4R�Z�(}@4Ms�!��m&%�(ע}�L?���/k(=����f	�d�H�IID�X��:o���D`A�Ɓ�Ē6;A��	�,�       �   u  x�Փ�N�0��{����b�m�rB��$��)k�(mI�I{{ܭ ������GNl}�'�����L��Y�.
���vU7�]�f�Ƴ��G����m
��e�֍���zE��ٌD�nL>��s��6��z�m��s���l���s�ru�|3cC1b@�lښuŠ[gd>h�YS��q[���x��� !�����^QrZ��� �0�
�� �?_�>�h\kv���`rzX��rgَձ�:�-�^��l���<˭7�QXd,Q���%aq�@��B�H����
{X��ˮj�I��f�q�P(7�3Ĕ�T� A%�d��R�DaD=�ھ����<�C�T<�
�jH�a�%�Xk_[X      �   "  x����NBA�=Oѝ��������r���`"薨�!!b���� ���������iOf6_Lo�0�/o���q�}
���n������}�]��8l__�L����s�W�w�)��x�,�	���%,(�bt9��$�C2Eu�@*95�vP��J!M���x�L.u�L�b���3dv!�J�Ŧ�)	$��F%Ks���kY��!af�>ē���թ���=�'wI��]�5�d�r�����#Y/�Z�'e<G+l9�����.�$�鉉���tDfG>�G�R�=�`��G�c      ~     x���1O�0��=��[[)���g�|L"�"��Z�Q�����,!�"ex���n�Y=mM��>����ؿ�c�q���9�w��5���u�(?����¼�?<�6f�|k�Z3# ^".�z%Q�K��]���?o�J\)%c�gS1���Db%Í�XB|R K����!�!�L6bt)U0$a��0e_B"y�Z�"A�L0Q%dbDẹX*%5�W&�$oRr�$�JH�Ar	��bI�B�IB9`%� A~&i�oAp/�      �   !  x�śQo7���)��-జ!���=h� H�sz@���vKr$�d��$���}�ʎ�iw׋��D6����!9����Wo.~����՛�?W����ra>t�C�;T�,����m�n�.�u�-����,���ns{^-?ț��7��޾k����]�~[���׿�xQ}���������q_5��v��� ���n�e�m��|�r�ޜ�Wo~y�Zދ�K�/T�jH5E��%y�Uss��ˋW���B�Xt�ۮ5�h\c0���{� ������Y&
�=�8�˓�,&T"<Q��`����A�9A�U��AL��L d�qHO7d���?E�&�m4�g���	&����&��+_���T_�v�0A�#�UZ]� �ճc��Yb=#o��F_��eh�@A!`�Xό!�iR�}0K��� �@
1̒�1�aRP9�%�sCp!i�0K���@�g	��1�����g���e��K�#�BRp8K�ur���rX(ush�k��*��R��qN�P#��ĘQ���j����R�M1����� E����v�jW#���Jy�D��U�i��f����&�����gkh2֞k+v�z����B�Ώ�Ì�L�RQ���.��&���G֐, ����x��9Wx��2�&8�k�B�t\,��]5�f�j�%gYaཝ��R�����`�B6=�ټz?��A� N#��'�XV��/��f�����4��/�H~����ȇ
|����Dԝ�:����hRJR���I�һp��* ��������Q��wE�C�؋���	D�� 5���[s�܇I��Ei���G֨�T$s���(�3>9J
�M�z��H=:1�5G�����d�1HST�+C!��;�>��X�H�e��`$3d����mo��!F���A�����8n��f��sʹ�5�V���ϗ��갬�߆���X� u^�8���܁��]�Ll#�`�yU�Sn�٧�P?C������.O�)�L����h�VC�����!���G�)��<��Ipj�Bd1���}e�3(�<3��"Z�����a
�E6�cWh�b����_u����@=z@%6�L�3�������Y�5�x��b����X-��Mu݈.�۪ɇM��2 ���bm�I!X�=����=��l �B��kإ��ؘ�d�L*$bpK���4I!�)�/H���#Ok!��@�Υ{mY���5ʙrw�`4r�������'�2iLV?������a�r�M;d(�!aS�	)�3sx��ArV�����Bњ��0t"��)v�l��^��M9h3A*����@*���Ρ}�F �#)#�=�j5�(��e�����B����J%�0}�.��*����u���w�!-����3!���ػ�HB����~��Ly;2�4ƛzH����m������Ғ"����f��|��I�YG�9�3�Z��5�j� ��h�A'R�I��T�)�옂�S�B#�����xA�M�-���e������R��j�����~��Oc��t�:����8:���>XԘ�`�c�����1ڨ����(��M�f�VC��R:�O�Ͳ#p�_�3knzw����U���3ʱ��R=�E�*�f�����Jw�Z�fC���$s�X�P��z���|�<9K*��@Ѡ\5Q�/u`>?K�5�� p`%/�P�nR�҉V��
�.�Oa�h'�����U�O�(�9i<^P� �|�td��q�
P��WW#�X[8]ԕND�V�ғ����Q6��Y�����¥S      }   @  x����j1�O��
k�L��&=�A(��U�dk7�`}��XGJ��ӒK>���r�^�n�r�yaM�;V{��6�lR���p�^&�xJ�2V}�C��9�ʭOS�����X����fl���u`e`M3��y��/����ZJ(hy�.wh�f 萁uh"!@���a��ID�T�j��gl��R�
sť0vx��}d�)���"ϕ���(Z� �о��wmt�У��dmQ��JD���q�r��8�� ����x�Rd~��%��B���3����7�PC�-�%e1��(R�i��V��[���p4�R��      �   y  x����N�0�}�J��&v/n����Ҥ-�9�IM�8�ا-OO"�`;X�ǚ�����`�p�QeR�Wv%AAW\��1�,d����B��\XHIQ7�IU(�5��`!Z)��L�����,�бk���Q�2Y5��)�j-�U��n>�^�v;�|�9��*�>����������{ٽ���~<I���e���k��x��;��f�|�s�����y�w��~��zP+�N�Z�oؽ�������^S��d��>��������'7� Ք����	f�Q�Mv~o߆w��~�LN��{v�t����������Ё��r����PL�x�$�q<3��6�G���7�)a>���$����K܏П����j���      �     x���Ak�0�{?ŻU!Ƽ�l�v'
Á:�ҥ�T����/����g�;���?�H�ޮ6;(׻�ƷSkdo?G�[j���&m-`t�?�p9�n��|�f���Xn���	0��BI5h߫�Na�|~]ma�@?,���K*% ^c;�&��-f�~ �Bek��i
��;���Ϳ�g��T��L�&�>E�#h�n����mlh�c�`c?��J�ؘ3J4'�cmx�%�}i@,�R���i��Fu�R��-�� {F�       �     x�͐�N�0��>���JI�K�4ab�P	�Dk��G�(��s���I��.�l���ҷ��7���ЇckN��w�̍�A��3�:�TO=)"�j���ɩ5�2��0��M�Ic���&3�g���?ө��ۑ�Q�Z��o�6{�����!�c��:���Gg9x�]t�"��h��)=,'$��BrV��d2}훉#���!��+�WY�2�eYD����{�py-�C@{R�&%�J�l]��l5)�+'e�X��4/�B���l�b��      �   �   x�ŏ=k�0Ew���%Y���V�%-M�ո�)�`�H��Ҵ��o��{�w��a�t�f|�i~=���4;Z?���%�k�|��x
�3d ��v��㵉��#��<tipm�̓��x��?�������j��Ô�U΂	Ur^
�7+��55�HU2���e�V(7`sW4�r�:i�
iť2�RЊ2��V��2?RU��q��~�� �յ���N�@v*�f���      �   �   x��α
�0��ݧ��
QL4�ک�� �vQC	XS��範�@��r��W�Mqk���+��~�Cdq�v2h��#����m����B@Z��JDc�\P[t��B���d?)â$n�� +�J`�uWUpY���b����,�s��i3���!8{�ߴ��&;ѦN��D˝��DK��������      �   M  x�Ŕ�k�0����V�v��U۝z���*϶Ӈ]S�����%JG�9!�� y��x�r�^�l`��<A{��T�i�Z�-JMJo���դ�0�2��}�R��BP�,m5}�1��`mfe�
I�&ь����u���8���pƓ(f�fƲ�1��X˓9�	�����E���
�B����[����R1s3mՀ�%��/q�:��v�,Ź*����\�{r�G�_D�_�w���ދ��6��q��'���x'�	�� $z��,v�#��jEC��,H�f��I�H:��$g���Z��:sz|aM�4�y�~)3���C�<��=�x$K:� �>      �   �   x�E�OO�0����u��n)cm�	�*�@�p��Ī��$ʟ��i���{~���S�>@^���D0cF�T��JI�[�S��BPJG�3��S6(��N4F73�0�10�Kb�k�||��N��x� �'=�~���H3<���7g�J�
����@<+�� i���䖝�@��G%�t��v6(��X����{��7m�+��<ն�����CՖu��u�TA])_?dY���a�      {     x�ݖ[W�H���y�g��з��� �����$Mh.鐋 �j���퀳]��ו䐾URU_wU�n���Ѻ��(sW�3�Dĉ�M��F��Z�b���܈x�lU��\�t7V3�O���/<�OύX���QT&O�"�3)�ر��T��)UK��"�ӏW�bT�"����J�>0��s�̗I���n�K�?N�{
��(A��nK���d��9�V���&��|겈�~o?l����L�X��A~�ӌ�*�M���,Z)�'����b�C�C5Q��D �. 5�S�7�&�h>�{2�"\H�塾t?�3��ۇN����������f�<M��b����ҮQz�3"�Q��xR�UK"��-�贽�x���\��Yp�����+d��7`0��_�!��I,�X�쇦�ǩ�K�����%c�n@��V�,�I��!�{�-��x����\�Ǭ�k˫	�������;��5�k1��A}��J����fئ�-x��q��2 ���c��z�e�E�Pm�Ra ����!8�ie�םɪ7m�:5���j��w��֟�bf�E���y�[�+����֝|��؁�Z�qʈ�-f�� ?dÃ,I�/J�9��
޼tP��_7�5ٵ��\����H���f�ݳ�޹���tM��Q��9nͧ`,� B ��c�.#T�S��)��Ѱc	�7_N��i:�hg���Ȯ[-��1��J����1�l�=6[7��ܣ, �Y._������ ��7��#8�A�`Ӷ�}845�� <�ğ:E*8�P$��) p˴����&�z��ӥY(�����xd�y��\m���a�Iٛ\~!���@�)��~�
��X&���L�<I��$��i�\�@����h�Qu����1 ]�����d�%p��=6a7�4X7쵃�V�ة��l�AV{I�ݖb>.����Gf�=+v�@�Mjc�P�Z>}����3`�B�ڞ7s|�'��,@�K)z��}��^Θ�<��z�i��@���69ӌON�e�+{     