[RoutePrefix("api/jobpostings")]
    public class JobPostingsApiController : ApiController
    {
        public IJobPostingService _jobPostingService;

        public JobPostingsApiController(IJobPostingService jobPostingService)
        {
            _jobPostingService = jobPostingService;
        }

        [Route, HttpPost]
        public HttpResponseMessage Add(JobPostingAddRequest model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ModelState);
            }

            ItemResponse<int> response = new ItemResponse<int>();

            response.Item = _jobPostingService.Insert(model);

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("{id:int}"), HttpPut]
        public HttpResponseMessage Update(JobPostingUpdateRequest model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, ModelState);
            }

            _jobPostingService.Update(model);

            SuccessResponse response = new SuccessResponse();

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("{id:int}"), HttpGet]
        public HttpResponseMessage SelectById(int id)
        {

            ItemResponse<JobPosting> response = new ItemResponse<JobPosting>();

            response.Item = _jobPostingService.SelectById(id);

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route(), HttpGet]
        public HttpResponseMessage SelectAll()
        {

            ItemsResponse<JobPosting> response = new ItemsResponse<JobPosting>();

            response.Items = _jobPostingService.SelectAll();

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("search"), HttpGet]
        public HttpResponseMessage SearchByKeyword([FromUri]JobPostingSearchRequest searchRequest)
        {
            ItemsResponse<JobPosting> response = new ItemsResponse<JobPosting>();
            response.Items = _jobPostingService.SearchByKeyword(searchRequest);
            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("indeedsearch"), HttpGet]
        public HttpResponseMessage IndeedSearch([FromUri] JobPostingIndeedSearchRequest searchRequest)
        {
            var requestArray = new List<string>();
            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(searchRequest))
            {
                requestArray.Add(HttpUtility.UrlEncode(property.Name) + "=" + HttpUtility.UrlEncode(Convert.ToString(property.GetValue(searchRequest))));
            }

            string encodedParameters = string.Join("&", requestArray);

            string url = "http://api.indeed.com/ads/apisearch?" + encodedParameters;

            string str = "";

            using (WebClient client = new WebClient())
            {
                str = client.DownloadString(url);
            }

            JObject results = JObject.Parse(str);

            ItemResponse<JObject> response = new ItemResponse<JObject>();

            response.Item = results;

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("usajobssearch"), HttpGet]
        public HttpResponseMessage UsaJobsSearch([FromUri] JobPostingUsaJobsSearchRequest searchRequest)
        {
            var requestArray = new List<string>();
            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(searchRequest))
            {
                requestArray.Add(HttpUtility.UrlEncode(property.Name) + "=" + HttpUtility.UrlEncode(Convert.ToString(property.GetValue(searchRequest))));
            }

            string encodedParameters = string.Join("&", requestArray);

            string url = "https://data.usajobs.gov/api/Search?" + encodedParameters;

            string str = "";

            using (WebClient client = new WebClient())
            {
                client.Headers.Add("Host", "data.usajobs.gov");
                client.Headers.Add("User-Agent", WebConfigurationManager.AppSettings["UsaJobsUserAgent"]);
                client.Headers.Add("Authorization-Key", WebConfigurationManager.AppSettings["UsaJobsAuthorizationKey"]);
                str = client.DownloadString(url);
            }

            JObject results = JObject.Parse(str);

            ItemResponse<JObject> response = new ItemResponse<JObject>();

            response.Item = results;

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("{id:int}"), HttpDelete]
        public HttpResponseMessage Delete(int id)
        {
            _jobPostingService.Delete(id);

            SuccessResponse response = new SuccessResponse();

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        [Route("clicklog/{engineId:int}"), HttpPost]
        public HttpResponseMessage Add(int engineId)
        {
            JobSearchEngine jobSearchEngine = (JobSearchEngine)engineId;
            _jobPostingService.ClickLog(jobSearchEngine);

            SuccessResponse response = new SuccessResponse();

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
    }