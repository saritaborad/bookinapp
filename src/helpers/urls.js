export const generateSearchLink = (
  city,
  startDate = null,
  endDate = null,
  guests = 1,
  sort = "default",
  page = 1,
  tags,
  bedrooms,
  searchText
) => {
  return `/search?city=${city}${
    startDate ? "&from=" + startDate.format("YYYY-MM-DD") : ""
  }${endDate ? "&to=" + endDate.format("YYYY-MM-DD") : ""}${
    guests ? "&guests=" + guests : ""
  }${sort ? "&sort=" + sort : ""}${page ? "&page=" + page : ""}${
    tags?.length ? "&tags=" + tags.map((tag) => tag.tag) : ""
  }${
    bedrooms?.length
      ? "&bedrooms=" + bedrooms.map((bedroom) => bedroom.name)
      : ""
  }${searchText?.length ? "&searchText=" + searchText : ""}`;
};

export const getTagsIndex = (city) => {
    let tagsIndex;
    switch (city) {
        case 'abudhabi':
            tagsIndex = 'tagsAbuDhabi';
            break;

        case 'stpetersburg':
            tagsIndex = 'tagsStpetersburg';
            break;

        case 'dubai':
        default:
            tagsIndex = 'tagsDubai';
    }

    return tagsIndex;
};
